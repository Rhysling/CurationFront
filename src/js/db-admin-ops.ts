import { getFetchClient as fc } from "../stores/fetchclient-store.svelte";

// Dbs ***

export const getBackupList = async (dbName: Db) => {
	try {
		const response: Response = await fc().get(`/api/Db/GetBackupList?dbName=${dbName}`);
		return response.json() as Promise<string[]>;
	} catch (error) {
		console.error(error);
	}
};

export const getFile = async (fileName: string) => {
	try {
		const response: Response = await fc().get(`/api/Db/GetFile?fileName=${fileName}`);
		return response.text();
	} catch (error) {
		console.error(error);
	}
};

export const postBackup = async (dbName: Db) => {
	try {
		const response: Response = await fc().post(`/api/Db/Backup?dbName=${dbName}`);
		return response.text();
	}
	catch (error) {
		console.error(error);
	}
};

export const postRestore = async (fileName: string) => {
	try {
		const response: Response = await fc().post(`/api/Db/Restore?fileName=${fileName}`);
		return response.text();
	}
	catch (error) {
		console.error(error);
	}
};

export const postDelete = async (fileName: string) => {
	try {
		const response: Response = await fc().post(`/api/Db/Delete?fileName=${fileName}`);
		return response.text();
	}
	catch (error) {
		console.error(error);
	}
};