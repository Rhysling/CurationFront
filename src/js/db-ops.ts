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

// Users ***

export const postLogin = async (userLogin: UserLogin) => {
	try {
		const response: AxiosResponse<UserClientRemote | undefined> = await ax().post("/api/Login", userLogin);
		return response.data;
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
