import { user, logOut } from "./user-store.svelte";

declare var baseURL: string;

type FetchHeaders = {
	"Content-Type"?: "application/json" | "multipart/form-data",
	"Authorization"?: string,
};

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE";

type FetchOptions = {
	body?: string | FormData,
	headers?: FetchHeaders,
};

type FetchIntercepts = Record<number, (response: Response) => Promise<void>>;

function createFetcher(defaultHeaders: FetchHeaders = {}, intercepts: FetchIntercepts = {}) {

	const fetcher = async (path: string, method: FetchMethod, options: FetchOptions = {}) => {
		const url = `${baseURL}${path}`;

		// Only JSON bodies get a Content-Type. On a bodyless GET it would force a CORS
		// preflight, and FormData needs the browser to set it with the proper boundary.
		const headers: FetchHeaders = {
			...(typeof options.body === "string" ? { "Content-Type": "application/json" } : {}),
			...defaultHeaders,
			...options.headers,
		};

		const response = await globalThis.fetch(url, { method, ...options, headers });

		const intercept = intercepts[response.status];
		if (intercept) await intercept(response);

		return response;
	};

	fetcher.get = (path: string, options: FetchOptions = {}) => fetcher(path, "GET", options);
	fetcher.post = (path: string, value?: any, options: FetchOptions = {}) => {
		const body = value !== undefined ? { body: JSON.stringify(value) } : {}
		return fetcher(path, "POST", { ...options, ...body });
	};
	fetcher.postFormData = (path: string, value: FormData, options: FetchOptions = {}) => {
		return fetcher(path, "POST", { ...options, body: value });
	};
	// fetcher.put = (path: string, options: Omit<FetchOptions, "body"> = {}) => fetcher(path, "PUT", options);
	// fetcher.delete = (path: string, options: Omit<FetchOptions, "body"> = {}) => fetcher(path, "DELETE", options);

	return fetcher;
}

const intercepts: FetchIntercepts = {
	401: async () => {
		logOut();
	},
	403: async (response) => {
		// .text(), not .json(): a 403 body is often empty or plain text.
		console.warn("Permission denied:", await response.clone().text());
	},
	429: async (response) => {
		const retryAfter = response.headers.get("Retry-After");
		console.warn(`Rate limited. Retry after ${retryAfter}s`);
	},
};

const fetchClient = $derived.by(() => {
	//const h1: FetchHeaders = { "Content-Type": "application/json" };
	const h2: FetchHeaders = (user.value?.token) ? { Authorization: `Bearer ${user.value.token}` } : {};
	const defaultHeaders: FetchHeaders = { ...h2 };

	return createFetcher(defaultHeaders, intercepts);
});

export const getFetchClient = () => fetchClient;