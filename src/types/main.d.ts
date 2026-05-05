type Route = {
	title: string;
	navName?: string;
	page: string;
	path: string;
	isAdmin?: boolean;
	isHidden?: boolean;
	isExpanded?: boolean;
	children?: Route[];
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type ValidationState = boolean | undefined;

type PageState = {
	path: string;
	paramObj: Record<string, string>;
	isNavFromUrl: boolean;
};

type AuditList = {
	missing: PictureItem[];
	orphans: PictureItem[];
};

type UserSettings = {
	isNewestFirst: boolean;
};

type Db = "PicturesDb" | "UsersDb";
