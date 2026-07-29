
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
	keywords: [],
	description: "",
	link: "",
	isMissing: false,
	isDeleted: false,
});

export const getEmptyUser = (): UserClientRemote => ({
	id: 0,
	email: "",
	fullName: "",
	token: "",
	isAdmin: false,
	hasPw: false,
	isDisabled: false,
	isDeleted: false,
});

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
