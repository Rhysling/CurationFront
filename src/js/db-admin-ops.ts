import type { AxiosResponse } from "axios";
import { getHttpClient as ax } from "../stores/httpclient-store.svelte";

// Dbs ***

export const getBackupList = async (dbName: Db) => {
	try {
		const response: AxiosResponse<string[]> = await ax().get(`/api/Db/GetBackupList?dbName=${dbName}`);
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const getFile = async (fileName: string) => {
	try {
		const response: AxiosResponse<any> = await ax().get(`/api/Db/GetFile?fileName=${fileName}`);
		return response;
	} catch (error) {
		console.error(error);
	}
};

export const postBackup = async (dbName: Db) => {
	try {
		const response: AxiosResponse<string> = await ax().post(`/api/Db/Backup?dbName=${dbName}`);
		return response;
	}
	catch (error) {
		console.error(error);
	}
};
