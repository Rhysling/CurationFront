# Task: Add cookieless traffic analytics to the backend (.NET 10, SQLite)

This file is a self-contained brief for building the server side of traffic analytics in this .NET 10 backend. The front end (CurationFront, Svelte) is **already built and deployed against the contract below**, so the contract is fixed.
- If something in this backend makes part of the contract impossible, stop and ask. Don't change the contract on your own.
- If anything is unclear, ask before guessing.

Frontend reference files (for context only; they live in the CurationFront repo):
- `src/js/tracker.ts`: sends the collection beacons.
- `src/js/db-traffic-ops.ts`: calls the report endpoints.
- `src/types/traffic.d.ts`: TypeScript shapes of every request and response below.

---

## 0. Before you write code

1. **Explore this solution and follow its existing conventions.** In particular, find:
   - how controllers/endpoints are organized (controllers vs minimal APIs) and how routes are named. The existing endpoints look like `/api/Db/GetBackupList` and `/api/Pictures/GetPublicList`;
   - how PicturesDb and UsersDb are opened (EF Core vs `Microsoft.Data.Sqlite`/Dapper), how connection strings and file paths are configured, and how schemas are created or migrated;
   - the **admin authorization** policy or attribute on `/api/Db/*`. The report endpoints must use exactly the same one;
   - the **backup/restore** code behind `/api/Db/GetBackupList`, `Backup`, `Restore`, `Delete` and `GetFile`;
   - the CORS policy and middleware order in `Program.cs`;
   - whether the API runs behind IIS / a reverse proxy, which matters for the client IP;
   - the test project and its conventions, if there is one;
   - the TypeScript model generator (`tools/make-ts-models` in the frontend repo reads this solution). New DTO names must not clash with existing ones.
2. Write a short plan, mapping each section below to the files you'll add or change. Then implement.

---

## 1. Principles (must hold)

- **No cookies, no client IDs.** Visitors are identified by a server-side hash whose salt rotates daily. Old salts are deleted so old hashes can't be linked or reversed.
- **Never store a raw IP address or full User-Agent string.** Not in the DB, and not in logs: don't log request bodies or IPs from the collect endpoint.
- **The collect endpoint never reveals anything.** It is anonymous, rate-limited, and always answers `204` whether the event is stored, dropped or invalid.
- **Tracking must never affect the rest of the API.** Catch and swallow (with a debug log only) every failure in the collect path.
- The frontend already skips sending while an admin is logged in and for automated browsers. The server additionally filters bots by User-Agent.

---

## 2. Database: new `TrafficDb`

- Create a **new, separate SQLite database file** named `TrafficDb`, next to PicturesDb/UsersDb and using the same path/config conventions.
- Create the schema on startup if it doesn't exist, matching how the other DBs are initialized.
- Turn on WAL mode (`PRAGMA journal_mode=WAL`) so collection writes don't block report reads.
- **Add `TrafficDb` to the backup/restore system.** It must appear in `GetBackupList` and support Backup / Restore / Delete / GetFile exactly like the other DBs. The frontend `Db` type already includes `"TrafficDb"`.

```sql
CREATE TABLE IF NOT EXISTS Events (
  Id            INTEGER PRIMARY KEY,
  Ts            INTEGER NOT NULL,          -- unix ms, UTC, server clock
  SchemaVersion INTEGER NOT NULL DEFAULT 1,
  EventType     TEXT    NOT NULL,          -- 'pageview' | 'event'
  EventName     TEXT    NULL,              -- for 'event' rows, e.g. 'pic_view'
  PageviewId    TEXT    NULL,
  VisitorHash   TEXT    NOT NULL,
  SessionId     TEXT    NOT NULL,
  Path          TEXT    NOT NULL,
  Page          TEXT    NULL,
  PicSlug       TEXT    NULL,
  Keyword       TEXT    NULL,
  IsEntry       INTEGER NOT NULL DEFAULT 0, -- 1 = first pageview of its session
  ReferrerHost  TEXT    NULL,              -- NULL = direct / internal
  UtmSource     TEXT    NULL,
  UtmMedium     TEXT    NULL,
  UtmCampaign   TEXT    NULL,
  Browser       TEXT    NULL,
  Os            TEXT    NULL,
  DeviceType    TEXT    NULL,              -- 'desktop' | 'mobile' | 'tablet'
  ScreenBucket  TEXT    NULL,              -- '<640' | '640-1024' | '1024-1440' | '>1440'
  Lang          TEXT    NULL,
  Country       TEXT    NULL,              -- reserved (ISO-2); not populated in v1
  DurationMs    INTEGER NULL,              -- set by 'leave'
  Props         TEXT    NULL               -- JSON, for 'event' rows
);
CREATE INDEX IF NOT EXISTS IX_Events_Ts       ON Events(Ts);
CREATE INDEX IF NOT EXISTS IX_Events_Visitor  ON Events(VisitorHash, Ts);
CREATE INDEX IF NOT EXISTS IX_Events_Session  ON Events(SessionId);
CREATE INDEX IF NOT EXISTS IX_Events_Pageview ON Events(PageviewId);

CREATE TABLE IF NOT EXISTS Salts (
  Day  TEXT PRIMARY KEY,                   -- 'yyyy-MM-dd' (UTC)
  Salt BLOB NOT NULL
);
```

If the solution uses EF Core, model these as entities with the same column names and indexes. Otherwise use `Microsoft.Data.Sqlite` (+ Dapper if it's already used). **Every SQL value must be a parameter.**

---

## 3. `POST /api/Traffic/Collect` (anonymous)

### Transport facts (don't "fix" these)
- The body is JSON, but it arrives as **`Content-Type: text/plain;charset=UTF-8`** with **no Authorization header**. The browser sends it with `navigator.sendBeacon`, or with `fetch(..., { mode: "no-cors", keepalive: true })` as a fallback. Both are CORS "simple" requests, so there is no preflight and the client never reads the response.
- So **MVC/minimal-API model binding will not parse it.** Read the body yourself.
- The endpoint must allow anonymous access even if there is a global auth fallback policy (`[AllowAnonymous]` / `.AllowAnonymous()`).

### Request shapes (camelCase, case-insensitive)
```jsonc
// pageview
{ "type": "pageview", "v": 1, "pvId": "uuid",
  "path": "/curation", "page": "Curation",
  "pic": "sunset",            // optional: the `p` query param (picture slug)
  "keyword": "food",          // optional: lowercased `keyword` query param
  "ref": "https://www.google.com/search?q=x",   // optional: first pageview of a page load only
  "utmSource": "news", "utmMedium": "email", "utmCampaign": "fall", // optional: first pageview only
  "sw": 1280,                 // window.innerWidth
  "lang": "en-US" }

// leave: the page was hidden or closed, or the SPA navigated away. MAY REPEAT for the same pvId.
{ "type": "leave", "v": 1, "pvId": "uuid", "durationMs": 42000 }

// event: future granular events (not sent by the v1 frontend)
{ "type": "event", "v": 1, "pvId": "uuid-or-empty", "name": "pic_view", "props": { "slug": "sunset" } }
```

### Processing steps
1. **Read the body:**
   - Turn on request buffering, or read `Request.Body` with a `StreamReader`, up to **4 KB**. If the body is larger, drop it.
   - Then `JsonSerializer.Deserialize<TrafficEventIn>(body, new JsonSerializerOptions(JsonSerializerDefaults.Web))`.
   - If parsing fails, drop the event.
2. **Response:** always `204 No Content`, on every path including drops and exceptions.
3. **Rate limit:**
   - Use the built-in `Microsoft.AspNetCore.RateLimiting` (`AddRateLimiter` + a named policy): a fixed window of **60 requests/min per client IP**, partitioned by IP.
   - Apply it to this endpoint only.
   - Rejected requests get a `204` too, not a `429`: set `RejectionStatusCode = 204` for this policy, or handle `OnRejected`.
4. **Bot / validity filter.** Drop the event if:
   - the `User-Agent` is empty, or matches `bot|crawl|spider|slurp|headless|lighthouse|preview|curl|wget|python|httpclient|okhttp` (case-insensitive, compiled `Regex`);
   - `type` is not `pageview`, `leave` or `event`;
   - `pvId` is empty;
   - for `pageview`: `path` is null, doesn't start with `/`, or is longer than 256 characters.

   Truncate every other string field to 256 characters.
5. **Client IP:**
   - Use `HttpContext.Connection.RemoteIpAddress`.
   - If the app runs behind IIS out-of-process, ARR or another proxy, configure `ForwardedHeadersOptions` (`XForwardedFor`, with the correct `KnownProxies`/`KnownNetworks`) and `UseForwardedHeaders()` early in the pipeline, so this is the real client.
   - If the IP can't be determined, use an empty string. Don't drop the event.
6. **VisitorHash:**
   - Compute `Convert.ToHexString(SHA256.HashData(salt ‖ UTF8("polson.com") ‖ UTF8(ip) ‖ UTF8(userAgent)))[..32]`.
   - `salt` is the `Salts` row for **today's UTC date**. If it's missing, insert `RandomNumberGenerator.GetBytes(32)` with `INSERT OR IGNORE`, then re-select it (this survives concurrent first requests).
   - Cache the current salt in memory, keyed by day.
7. **User-Agent parsing:**
   - Use the `UAParser` NuGet package (`Parser.GetDefault()`, a singleton) and store `Browser = ua.UA.Family` and `Os = ua.OS.Family`.
   - Set `DeviceType` to:
     - `tablet` if the UA matches `iPad|Tablet`, or `Android` without `Mobile`;
     - else `mobile` if it matches `Mobi|iPhone|Android`;
     - else `desktop`.
   - The UA string itself is used only in memory.
8. **ReferrerHost:**
   - If `ref` parses as an absolute http(s) URI, store `uri.Host`, lowercased with any leading `www.` removed.
   - Store NULL if it is empty or unparsable, or if the host is one of the site's own hosts. Make the own-host list configurable, defaulting to `polson.com` and `localhost`.
   - **Never store the referrer's path or query.**
9. **ScreenBucket** from `sw`:
   - `< 640` → `<640`
   - `< 1024` → `640-1024`
   - `< 1440` → `1024-1440`
   - otherwise `>1440`
   - NULL if `sw` is missing or ≤ 0.
10. **Lang:** `lang`, trimmed, at most 16 characters.
11. **Sessionization** (pageview only), with a 30-minute inactivity window:
    ```sql
    SELECT SessionId FROM Events
     WHERE VisitorHash = @hash AND Ts >= @now - 1800000
     ORDER BY Ts DESC LIMIT 1;
    ```
    - If a row is found, reuse its `SessionId` and set `IsEntry = 0`.
    - Otherwise, set `SessionId = Guid.NewGuid().ToString("N")` and `IsEntry = 1`.
12. **`pageview`:** INSERT one row with:
    - `Ts = now` (server UTC ms) and `EventType='pageview'`;
    - `PageviewId = pvId`, `PicSlug = pic`, `Keyword = keyword?.ToLowerInvariant()`, `UtmSource`/`UtmMedium`/`UtmCampaign`;
    - plus all the derived fields above.
13. **`leave`:**
    ```sql
    UPDATE Events SET DurationMs = MAX(COALESCE(DurationMs, 0), @durationMs)
     WHERE PageviewId = @pvId AND VisitorHash = @hash AND EventType = 'pageview';
    ```
    - Clamp `durationMs` to 0–1,800,000 ms.
    - If no row matches, do nothing.
    - Repeated leaves for one pvId are normal, which is why the update keeps the max.
14. **`event`:**
    - Accept it only if `name` is on a configurable whitelist. It is **empty in v1**, so all `event` posts are dropped for now.
    - When accepted: INSERT with `EventType='event'`, `EventName=name`, and `Props` = the raw `props` JSON (drop it if larger than 2 KB).
    - Take `SessionId`, `Path` and `Page` from the pageview row with `PageviewId = pvId` if there is one. Otherwise use the visitor's latest session, or a new one, with `Path='/'`.

---

## 4. Report endpoints (admin-only)

- Protect these with **the same authorization as `/api/Db/*`**. The frontend sends `Authorization: Bearer <token>` and uses the existing CORS policy. On 401 the frontend logs the user out.
- Serialize JSON as **camelCase** (`JsonSerializerDefaults.Web`).
- All four use HTTP GET with query parameters:

| param | type | meaning |
|---|---|---|
| `from` | long | unix ms, inclusive |
| `to` | long | unix ms, exclusive; must be > `from`, else 400 |
| `tzOffsetMin` | int | viewer's minutes **east** of UTC (e.g. `-300` for US Eastern standard time). Used only for bucketing; clamp to ±840. |

Define `@offMs = tzOffsetMin * 60000`. Every report query filters `EventType = 'pageview' AND Ts >= @from AND Ts < @to`.

### 4.1 `GET /api/Traffic/Summary?from&to&tzOffsetMin`
Response:
```jsonc
{
  "current":  { "visitors": 0, "visits": 0, "pageviews": 0, "bounceRate": 0.0, "avgVisitMs": 0 },
  "previous": { "visitors": 0, "visits": 0, "pageviews": 0, "bounceRate": 0.0, "avgVisitMs": 0 }
}
```
`previous` uses the same queries over `[from - (to - from), from)`.

```sql
-- visitors
SELECT COUNT(DISTINCT VisitorHash) FROM Events
 WHERE EventType = 'pageview' AND Ts >= @from AND Ts < @to;

-- visits, pageviews, bounceRate (0..1), avgVisitMs
WITH s AS (
  SELECT SessionId,
         COUNT(*)                          AS Pv,
         MIN(Ts)                           AS StartTs,
         MAX(Ts + COALESCE(DurationMs, 0)) AS EndTs
  FROM Events
  WHERE EventType = 'pageview' AND Ts >= @from AND Ts < @to
  GROUP BY SessionId)
SELECT COUNT(*)                                            AS Visits,
       COALESCE(SUM(Pv), 0)                                AS Pageviews,
       COALESCE(AVG(CASE WHEN Pv = 1 THEN 1.0 ELSE 0 END), 0) AS BounceRate,
       COALESCE(AVG(EndTs - StartTs), 0)                   AS AvgVisitMs
FROM s;
```
> Known and accepted: the hash rotates daily, so in a multi-day range one person who visits on several days counts as several visitors. The UI explains this.

### 4.2 `GET /api/Traffic/TimeSeries?from&to&tzOffsetMin&interval=hour|day|month`
Response: `[{ "t": 1732147200000, "visitors": 12, "pageviews": 30 }, ...]`, sorted by `t` ascending. An unknown `interval` gets a 400.

- **hour / day:** `@bucketMs` is 3,600,000 or 86,400,000.
  ```sql
  SELECT ((Ts + @offMs) / @bucketMs) * @bucketMs - @offMs AS T,
         COUNT(DISTINCT VisitorHash) AS Visitors,
         COUNT(*) AS Pageviews
  FROM Events
  WHERE EventType = 'pageview' AND Ts >= @from AND Ts < @to
  GROUP BY T ORDER BY T;
  ```
- **month:**
  - Group by `strftime('%Y-%m', (Ts + @offMs) / 1000, 'unixepoch')`.
  - Return `t` as the UTC ms of local midnight on the 1st of that month, i.e. `DateTimeOffset(year, month, 1, 0,0,0, TimeSpan.Zero).ToUnixTimeMilliseconds() - offMs`.
- **Zero-fill is required.** Return one point for every bucket from the bucket containing `from` up to the bucket containing `to - 1`, with zero counts where there's no data.
  - The frontend aligns `from` to a local hour, day or month boundary.
  - Expect at most about 400 buckets. Return 400 if a request would produce more than 1,000.

### 4.3 `GET /api/Traffic/Breakdown?from&to&tzOffsetMin&dimension=…&limit=50`
Response: `[{ "key": "/curation", "visitors": 900, "pageviews": 2500 }, ...]`.
- Ordered by visitors desc, then pageviews desc.
- `limit` defaults to 50; clamp it to 1–500.

Map `dimension` through a **hard-coded dictionary**. Never put request text into SQL. An unknown dimension gets a 400.

| dimension | key expression | extra WHERE |
|---|---|---|
| `page` | `Path` | |
| `entry` | `Path` | `AND IsEntry = 1` |
| `picture` | `PicSlug` | `AND PicSlug IS NOT NULL` |
| `keyword` | `Keyword` | `AND Keyword IS NOT NULL` |
| `referrer` | `COALESCE(ReferrerHost, '(direct)')` | `AND IsEntry = 1` |
| `utmSource` | `UtmSource` | `AND UtmSource IS NOT NULL` |
| `utmMedium` | `UtmMedium` | `AND UtmMedium IS NOT NULL` |
| `utmCampaign` | `UtmCampaign` | `AND UtmCampaign IS NOT NULL` |
| `browser` | `COALESCE(Browser, 'Unknown')` | |
| `os` | `COALESCE(Os, 'Unknown')` | |
| `device` | `COALESCE(DeviceType, 'Unknown')` | |
| `screen` | `COALESCE(ScreenBucket, 'Unknown')` | |
| `lang` | `COALESCE(Lang, 'Unknown')` | |
| `country` | `Country` | `AND Country IS NOT NULL` |

```sql
SELECT {key} AS Key, COUNT(DISTINCT VisitorHash) AS Visitors, COUNT(*) AS Pageviews
FROM Events
WHERE EventType = 'pageview' AND Ts >= @from AND Ts < @to {extra}
GROUP BY Key
ORDER BY Visitors DESC, Pageviews DESC
LIMIT @limit;
```
The frontend displays `(direct)` as "Direct / none". It hides the Countries list when the result is empty, which it always is in v1.

### 4.4 `GET /api/Traffic/Realtime`
Response: `{ "visitors": 3 }`. No parameters.
```sql
SELECT COUNT(DISTINCT VisitorHash) FROM Events WHERE Ts >= @now - 300000;
```

---

## 5. Housekeeping: `BackgroundService`

Run once at startup (after a short delay), then every 24 hours:
- `DELETE FROM Salts WHERE Day < @todayUtc;`
- `DELETE FROM Events WHERE Ts < @now - 400 days;` This keeps 13 months for year-over-year comparisons. Make the retention period configurable.
- `PRAGMA optimize;`

Log counts at Information level and swallow and log errors. It must never crash the host.

---

## 6. Configuration

Add a `Traffic` section to `appsettings.json`, matching existing config conventions (options class + `IOptions<T>`):
```json
"Traffic": {
  "SiteKey": "polson.com",
  "OwnHosts": [ "polson.com", "localhost" ],
  "RetentionDays": 400,
  "CollectPermitsPerMinute": 60,
  "AllowedEventNames": []
}
```

---

## 7. Tests

If a test project exists, add tests in its style (e.g. xUnit + `WebApplicationFactory`, with a temp SQLite file) for:
- **Collect returns 204** for: a valid pageview, invalid JSON, an oversized body, a bot UA, an unknown type, and when the rate limit is exceeded.
- **Sessions:** two pageviews from the same IP+UA within 30 minutes share a `SessionId`, and only the first has `IsEntry=1`. After 30 minutes of inactivity, a new session starts.
- **Leave:** keeps the max duration, clamps values, and ignores unknown pvIds.
- **No raw IP or UA stored:** assert that no column contains the IP or the full UA.
- **Referrer:** own-host referrers are stored as NULL, and `www.` is stripped.
- **Summary:** bounce rate, average visit and previous-period values on a small seeded dataset.
- **TimeSeries:** zero-fill, and day bucketing with a non-zero `tzOffsetMin`.
- **Breakdown:** an unknown dimension gets a 400, and `limit` is clamped.
- **Report auth:** report endpoints return 401/403 without an admin token.

If there is no test project, verify with the curl commands in §8 and say so in your summary.

---

## 8. Manual verification

```sh
# pageview → expect 204 and one Events row (IsEntry=1)
curl -k -i -X POST https://localhost:7212/api/Traffic/Collect \
  -H "Content-Type: text/plain" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36" \
  --data '{"type":"pageview","v":1,"pvId":"t1","path":"/curation","page":"Curation","sw":1280,"lang":"en-US","ref":"https://www.google.com/search?q=x"}'

# leave → DurationMs = 5000 on that row
curl -k -i -X POST https://localhost:7212/api/Traffic/Collect \
  -H "Content-Type: text/plain" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36" \
  --data '{"type":"leave","v":1,"pvId":"t1","durationMs":5000}'

# bot → 204, no row
curl -k -i -X POST https://localhost:7212/api/Traffic/Collect -H "Content-Type: text/plain" \
  -H "User-Agent: Googlebot/2.1" --data '{"type":"pageview","v":1,"pvId":"t2","path":"/"}'

# reports (admin token from a logged-in session)
curl -k "https://localhost:7212/api/Traffic/Summary?from=0&to=9999999999999&tzOffsetMin=0" -H "Authorization: Bearer $TOKEN"
```

Then, with the frontend dev server running (`npm run dev` in CurationFront, port 5050):
1. Browse the site in a private window while **not** logged in.
2. Log in as admin and open `/traffic`. Every tab should show data.

---

## 9. Out of scope for v1 (designed for, don't build)

- **Granular events** (`pic_view`, `keyword_search`, `zoom_open`, `outbound_click`, web vitals): enabled later by adding names to `AllowedEventNames` and reporting on `json_extract(Props, '$.slug')`.
- **`Country`:** filled later from MaxMind GeoLite2 at collect time, while the IP is in memory.
- **`DailyRollups`:** a nightly table (day × dimension × key → visitors, pageviews) if volume grows, to serve ranges over 90 days.

---

## 10. When done, report

- The files you added or changed, and how TrafficDb is wired into backup/restore.
- Any deviation from this contract, with the reason.
- Proxy / forwarded-headers findings: is the real client IP being used?
- Test results, or the manual verification you performed.
