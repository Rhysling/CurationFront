import { getFetchClient as fc } from "../stores/fetchclient-store.svelte";

// Throws on a non-2xx status so an error body is never mistaken for data.
// Callers must `await` the body inside their try so parse failures are caught too.
export const ensureOk = (response: Response): Response => {
	if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
	return response;
};

// Pictures ***

export const getPicPublicList = async () => {
	try {
		const response: Response = await fc().get("/api/Pictures/GetPublicList");
		return (await ensureOk(response).json()) as PictureItem[];
	} catch (error) {
		console.error(error);
	}
};

export const getPicBySlug = async (slug: string) => {
	try {
		const response: Response = await fc().get(`/api/Pictures/GetBySlug?${new URLSearchParams({ slug })}`);
		return (await ensureOk(response).json()) as PictureItem;
	} catch (error) {
		console.error(error);
	}
};

export const getPicAdminList = async () => {
	try {
		const response: Response = await fc().get("/api/Pictures/GetAll");
		return (await ensureOk(response).json()) as PictureItem[];
	} catch (error) {
		console.error(error);
	}
};

export const getAuditList = async () => {
	try {
		const response: Response = await fc().get("/api/Pictures/GetAuditList");
		return (await ensureOk(response).json()) as AuditList;
	} catch (error) {
		console.error(error);
	}
};

export const postCleanPics = async () => {
	try {
		const response: Response = await fc().post("/api/Pictures/CleanPics");
		return (await ensureOk(response).json()) as PictureItem[];
	} catch (error) {
		console.error(error);
	}
};

export const postResequencePics = async () => {
	try {
		const response: Response = await fc().post("/api/Pictures/ResequencePics");
		return (await ensureOk(response).json()) as PictureItem[];
	} catch (error) {
		console.error(error);
	}
};

export const postPic = async (picItem: PictureItem) => {
	try {
		const response: Response = await fc().post("/api/Pictures/Save", picItem);
		return (await ensureOk(response).json()) as PictureItem | undefined;
	}
	catch (error) {
		console.error(error);
	}
};

export const postPicWithImg = async (picWithImg: FormData) => {
	try {
		const response: Response = await fc().postFormData("/api/Pictures/SaveWithImg", picWithImg);
		return (await ensureOk(response).json()) as PictureItem | undefined;
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
		return (await ensureOk(response).json()) as UserClientRemote[];
	} catch (error) {
		console.error(error);
	}
};

// Returns the saved user, a validation message (400), or undefined on any other failure.
export const postSaveUser = async (user: UserClientRemote) => {
	try {
		const response: Response = await fc().post("/api/Users/Save", user);

		if (response.status === 400)
			return await response.text();

		return (await ensureOk(response).json()) as UserClientRemote | undefined;
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
		return (await response.json()) as UserClientRemote;
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

// Returns "" on success, otherwise an error message to show.
export const postDestroyUser = async (user: UserClientRemote) => {
	try {
		const response: Response = await fc().post("/api/Users/Destroy", user);

		if (response.status === 400)
			return await response.text();

		ensureOk(response);
		return "";
	}
	catch (error) {
		console.error(error);
		return "Failed to destroy user. Please try again.";
	}
};

// Testing ***

export const getSecuredValue = async () => {
	try {
		const response: Response = await fc().get("/api/Test/GetSecuredValue");
		return await ensureOk(response).text();
	} catch (error) {
		console.error(error);
	}
};

export const getAdminValue = async () => {
	try {
		const response: Response = await fc().get("/api/Test/GetAdminValue");
		return await ensureOk(response).text();
	} catch (error) {
		console.error(error);
	}
};
