// Using MSBuild ver. 6.0.201 to load projects.
// Generated - 2022/03/19-15:00:05

// SOLUTION: FeederBack

// PROJECTS SEARCHED:
//	FeederBack
//	FeederBack.Common
//	FeederBack.Ops
//	FeederBack.Db

type INullable<T> = T | null | undefined;

// NAMESPACE: FeederBack.Common.Models

interface IEditPropertyRequest {
	objectId: INullable<string>;
	propName: INullable<string>;
	value: INullable<string>;
}

interface IEditResponse {
	isSuccess: boolean;
	message: string;
}

interface IKVP {
	key: string;
	value: string;
	sortSeq: number;
}

interface ILogItemOut {
	_id: string;
	_rev: INullable<string>;
	tbl: string;
	eventTimestamp: INullable<string>;
	eventDateGmt: INullable<string>;
	levelName: INullable<string>;
	levelId: number;
	appName: INullable<string>;
	message: INullable<string>;
	isException: boolean;
	infoObj: any;
	eventDatePT: string;
	eventDateGmtShort: string;
	infoObjDisplay: string;
}

interface IPostItem {
	_id: string;
	_rev: INullable<string>;
	tbl: string;
	feedType: string;
	feedId: string;
	postKey: string;
	postUnixDate: number;
	title: INullable<string>;
	description: INullable<string>;
	link: INullable<string>;
	guid: INullable<string>;
	pubDateGmt: INullable<string>;
}

interface IUserInfo {
	_id: INullable<string>;
	_rev: INullable<string>;
	tbl: string;
	userId: INullable<string>;
	fullName: INullable<string>;
	email: INullable<string>;
	subscriptionKey: INullable<string>;
	feedIds: Array<string>;
	isAdmin: boolean;
	isDisabled: boolean;
	lastLogin: INullable<string>;
	feedCountLimit: number;
	feedCountTotal: number;
	feedCounts: Array<IKVP>;
}

// NAMESPACE: FeederBack.Models

interface IAdminLogSearchVM {
	asOfDate: string;
	takeCount: number;
	isAllForDate: boolean;
}

interface IAdminLogVM {
	searchCriteria: INullable<IAdminLogSearchVM>;
	logItems: INullable<Array<ILogItemOut>>;
}

// NAMESPACE: No namespace found

interface IFeed {
	_id: string;
	_rev: INullable<string>;
	tbl: string;
	feedType: string;
	feedId: string;
	userName: INullable<string>;
	title: string;
	description: string;
	link: string;
	iconUrl: string;
	lastBuildDate: string;
	language: INullable<string>;
	category: INullable<string>;
	postItems: Array<IPostItem>;
	lastSave: string;
	lastPostKey: string;
	statusCode: number;
	isUpdating: boolean;
	isActive: boolean;
	exists: boolean;
}

interface IUsersFeedsVM {
	feeds: Array<IFeed>;
	users: Array<IUserInfo>;
	userFeedCounts: Array<IKVP>;
	postCounts: Array<IKVP>;
}

