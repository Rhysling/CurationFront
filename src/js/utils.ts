
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
	isDisabled: false,
	isDeleted: false,
});

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
