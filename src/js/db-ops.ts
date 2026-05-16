import { getFetchClient as fc } from "../stores/fetchclient-store.svelte";

// Pictures ***

export const getPicPublicList = async () => {
	try {
		const response: Response = await fc().get("/api/Pictures/GetPublicList");
		return response.json() as Promise<PictureItem[]>;
	} catch (error) {
		console.error(error);
	}
};

export const getPicBySlug = async (slug: string) => {
	try {
		const response: Response = await fc().get(`/api/Pictures/GetBySlug?slug=${slug}`);
		return response.json() as Promise<PictureItem>;
	} catch (error) {
		console.error(error);
	}
};

export const getPicAdminList = async () => {
	try {
		const response: Response = await fc().get("/api/Pictures/GetAll");
		return response.json() as Promise<PictureItem[]>;
	} catch (error) {
		console.error(error);
	}
};

export const getAuditList = async () => {
	try {
		const response: Response = await fc().get("/api/Pictures/GetAuditList");
		return response.json() as Promise<AuditList>;
	} catch (error) {
		console.error(error);
	}
};

export const postCleanPics = async () => {
	try {
		const response: Response = await fc().post("/api/Pictures/CleanPics");
		return response.json() as Promise<PictureItem[]>;
	} catch (error) {
		console.error(error);
	}
};

export const postPic = async (picItem: PictureItem) => {
	try {
		const response: Response = await fc().post("/api/Pictures/Save", picItem);
		return response.json() as Promise<PictureItem | undefined>;
	}
	catch (error) {
		console.error(error);
	}
};

export const postPicWithImg = async (picWithImg: FormData) => {
	try {
		const response: Response = await fc().postFormData("/api/Pictures/SaveWithImg", picWithImg);
		return response.json() as Promise<PictureItem | undefined>;
	}
	catch (error) {
		console.error(error);
	}
};

export const postDestroyPic = async (picItem: PictureItem) => {
	try {
		const response: Response = await fc().post("/api/Pictures/Destroy", picItem);
		return response;
	}
	catch (error) {
		console.error(error);
	}
};

// Users ***

export const getUserList = async () => {
	try {
		const response: Response = await fc().get("/api/Users/GetAll");
		return response.json() as Promise<UserClientRemote[]>;
	} catch (error) {
		console.error(error);
	}
};

export const postSaveUser = async (user: UserClientRemote) => {
	try {
		const response: Response = await fc().post("/api/Users/Save", user);

		if (response.status === 400)
			return response.text();

		return response.json() as Promise<UserClientRemote | undefined>;
	}
	catch (error) {
		console.error(error);
	}
};

export const postLogin = async (userLogin: UserLogin) => {
	try {
		const response: Response = await fc().post("/api/Login", userLogin);
		return response.json() as Promise<UserClientRemote | undefined>;
	}
	catch (error) {
		console.error(error);
	}
};

export const postUpdatePw = async (userLogin: UserLogin) => {
	try {
		const response: Response = await fc().post("/api/Users/UpdatePassword", userLogin);
		//return response.json() as Promise<UserClientRemote | undefined>;
	}
	catch (error) {
		console.error(error);
	}
};

export const postDestroyUser = async (user: UserClientRemote) => {
	try {
		const response: Response = await fc().post("/api/Users/Destroy", user);

		if (response.status === 400)
			return await response.text();

		return "";
	}
	catch (error) {
		console.error(error);
	}
};

// Testing ***

export const getSecuredValue = async () => {
	try {
		const response: Response = await fc().get("/api/Test/GetSecuredValue");
		return response.text() as Promise<string>;
	} catch (error) {
		console.error(error);
	}
};

export const getAdminValue = async () => {
	try {
		const response: Response = await fc().get("/api/Test/GetAdminValue");
		return response.text() as Promise<string>;
	} catch (error) {
		console.error(error);
	}
};
