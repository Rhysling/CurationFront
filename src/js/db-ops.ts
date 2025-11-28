import type { AxiosResponse } from "axios";
import { getHttpClient as ax } from "../stores/httpclient-store.svelte";

// Pictures ***

export const getPicPublicList = async () => {
	try {
		const response: AxiosResponse<PictureItem[]> = await ax().get("/api/Pictures/GetPublicList");
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const getPicBySlug = async (slug: string) => {
	try {
		const response: AxiosResponse<PictureItem> = await ax().get(`/api/Pictures/GetBySlug?slug=${slug}`);
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const getPicAdminList = async () => {
	try {
		const response: AxiosResponse<PictureItem[]> = await ax().get("/api/Pictures/GetAll");
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const getCleanPics = async () => {
	try {
		const response: AxiosResponse<PictureItem[]> = await ax().get("/api/Pictures/GetCleanPics");
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const postPic = async (picItem: PictureItem) => {
	try {
		const response: AxiosResponse<PictureItem | undefined> = await ax().post("/api/Pictures/Save", picItem);
		return response;
	}
	catch (error) {
		console.error(error);
	}
};

export const postPicWithImg = async (picWithImg: FormData) => {
	try {
		const response: AxiosResponse<PictureItem | undefined> = await ax().post("/api/Pictures/SaveWithImg", picWithImg, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response;
	}
	catch (error) {
		console.error(error);
	}
};

export const postDestroyPic = async (picItem: PictureItem) => {
	try {
		const response: AxiosResponse<undefined> = await ax().post("/api/Pictures/Destroy", picItem);
		return response;
	}
	catch (error) {
		console.error(error);
	}
};

// Users ***

export const getUserList = async () => {
	try {
		const response: AxiosResponse<UserClientRemote[]> = await ax().get("/api/Users/GetAll");
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const postUser = async (user: UserClientRemote) => {
	try {
		const response: AxiosResponse<UserClientRemote | undefined> = await ax().post("/api/Users/Save", user);
		return response;
	}
	catch (error) {
		console.error(error);
	}
};

export const postLogin = async (userLogin: UserLogin) => {
	try {
		const response: AxiosResponse<UserClientRemote | undefined> = await ax().post("/api/Login", userLogin);
		return response;
	}
	catch (error) {
		console.error(error);
	}
};

export const postUpdatePw = async (userLogin: UserLogin) => {
	try {
		const response: AxiosResponse<UserClientRemote | undefined> = await ax().post("api/Users/UpdatePassword", userLogin);
		return response;
	}
	catch (error) {
		console.error(error);
	}
};

// Testing ***

export const getSecuredValue = async () => {
	try {
		const response: AxiosResponse<string> = await ax().get("/api/Test/GetSecuredValue");
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const getAdminValue = async () => {
	try {
		const response: AxiosResponse<string> = await ax().get("/api/Test/GetAdminValue");
		return response;
	} catch (error) {
		console.error(error);
	}
};
