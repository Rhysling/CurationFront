import { getFetchClient as fc } from "../stores/fetchclient-store.svelte";

// Dbs ***

export const getBackupList = async () => {
	try {
		const response: Response = await fc().get(`/api/Db/GetBackupList`);
		return response.json() as Promise<string[]>;
	} catch (error) {
		console.error(error);
	}
};

export const getFile = async (fileName: string) => {
	try {
		const response: Response = await fc().get(`/api/Db/GetFile?${new URLSearchParams({ fileName })}`);
		return response.blob();
	} catch (error) {
		console.error(error);
	}
};

export const postBackup = async () => {
	try {
		const response: Response = await fc().post(`/api/Db/Backup`);
		return response.text();
	}
	catch (error) {
		console.error(error);
	}
};

export const postRestore = async (fileName: string) => {
	try {
		const response: Response = await fc().post(`/api/Db/Restore?${new URLSearchParams({ fileName })}`);
		return response.text();
	}
	catch (error) {
		console.error(error);
	}
};

export const postDelete = async (fileName: string) => {
	try {
		const response: Response = await fc().post(`/api/Db/Delete?${new URLSearchParams({ fileName })}`);
		return response.text();
	}
	catch (error) {
		console.error(error);
	}
};