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

type KVPair = Record<string, string>;

type ValidationState = boolean | undefined;

type PageState = {
	itemsPerPage: number;
	itemCount: number;
	currentPage: number;
	startIndex: number;
	endIndex: number;
};

type AuditList = {
	missing: PictureItem[];
	orphans: PictureItem[];
};

type UserSettings = {
	isNewestFirst: boolean;
};

type Db = "PicturesDb" | "UsersDb";
