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
		const response: Response = await fc().get(`/api/Pictures/GetBySlug?${new URLSearchParams({ slug })}`);
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

declare var baseURL: string;

export const postLogin = async (userLogin: UserLogin): Promise<UserClientRemote | null> => {
	try {
		// Use bare fetch — the global client intercepts 401 with logOut(), which must
		// not fire during a login attempt (wrong credentials legitimately return 401).
		const response = await globalThis.fetch(`${baseURL}/api/Users/Login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(userLogin),
		});
		if (!response.ok) return null;
		return response.json() as Promise<UserClientRemote>;
	}
	catch (error) {
		console.error(error);
		return null;
	}
};

export const postUpdatePw = async (userLogin: UserLogin): Promise<boolean> => {
	try {
		const response: Response = await fc().post("/api/Users/UpdatePassword", userLogin);
		return response.ok;
	}
	catch (error) {
		console.error(error);
		return false;
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
