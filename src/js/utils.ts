
import { setIsNewestFirst } from "../stores/user-settings-store.svelte";
import { updateQueryStringParam } from "../stores/route-store.svelte";

declare var appVersionKey: string;
export const getAppVersion = () => appVersionKey;

declare var baseURL: string;
export const getBaseURL = () => baseURL;

export const getEmptyPicItem = (): PictureItem => ({
	id: 0,
	fileName: "",
	seq: 999,
	ts: 0,
	title: "",
	description: "",
	keywords: [],
	keywordsAll: undefined,
	link: "",
	isMissing: false,
	isDeleted: false,
	isRss: false,
});

export { getEmptyUser } from "../stores/user-store.svelte";

// The "p" query-string param is a file name minus its extension. Matching must be
// exact — a prefix match makes "cuisine" resolve to "cuisine-popularity.png".
export const getSlug = (fileName: string): string => {
	const ixp = fileName.lastIndexOf(".");
	return ixp > 0 ? fileName.substring(0, ixp) : "";
};

export const orderBySeq = (list: PictureItem[]): void => {
	list.sort((a, b) => a.seq - b.seq);
	setIsNewestFirst(false);
	updateQueryStringParam("newest", undefined);
};

export const orderByTs = (list: PictureItem[]): void => {
	list.sort((a, b) => b.ts - a.ts);
	setIsNewestFirst(true);
	updateQueryStringParam("newest", "true");
};

// Extract keywords
const getKeywordsFromFileName = (fileName: string): string[] => {
	return getSlug(fileName.toLowerCase()).split("-");
};

const getKeywordsFromTitle = (title: string): string[] => {
	return title.toLowerCase().replace(/[\[\].,!#*]/g, "").split(" ").filter((kw) => kw.length > 0);
};

export const mapKeywordsAll = (pi: PictureItem): PictureItem => {
	pi.keywordsAll = [
		...pi.keywords.map((kw) => kw.trim().toLowerCase()),
		...getKeywordsFromFileName(pi.fileName),
		...getKeywordsFromTitle(pi.title || ""),
	].filter((kw) => kw.length > 0);
	return pi;
};

export const getKeywordsList = (pil: PictureItem[]): string[] => {
	const kwSet = new Set<string>();
	pil.forEach((pi) => {
		if (pi.keywordsAll) pi.keywordsAll.forEach((kw) => kwSet.add(kw));
	});
	return Array.from(kwSet).sort((a, b) => a.localeCompare(b));
};