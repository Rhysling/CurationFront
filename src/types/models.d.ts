// Using MSBuild ver. 6.0.201 to load projects.
// Generated - 2022/03/19-15:00:05

// SOLUTION: FeederBack

// PROJECTS SEARCHED:
//	FeederBack
//	FeederBack.Common
//	FeederBack.Ops
//	FeederBack.Db

type INullable<T> = T | null | undefined;

// NAMESPACE: temp

type UserClientRemote = {
	id: number;
	email: string;
	fullName: string;
	token: string;
	isAdmin: boolean;
	isDisabled: boolean;
	isDeleted: boolean;
}

type UserLogin = {
	email: string;
	pw: string;
}

type PictureItem = {
	id: number;
	fileName: string;
	seq: number;
	ts: number;
	keywords: string[];
	description: INullable<string>;
	isMissing: boolean;
	isDeleted: boolean;
}
