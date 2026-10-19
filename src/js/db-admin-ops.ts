import { getFetchClient as fc } from "../stores/fetchclient-store.svelte";
import { ensureOk } from "./db-ops";

// Dbs ***

export const getBackupList = async () => {
	try {
		const response: Response = await fc().get(`/api/Db/GetBackupList`);
		return (await ensureOk(response).json()) as string[];
	} catch (error) {
		console.error(error);
	}
};

export const getFile = async (fileName: string) => {
	try {
		const response: Response = await fc().get(`/api/Db/GetFile?${new URLSearchParams({ fileName })}`);
		return await ensureOk(response).blob();
	} catch (error) {
		console.error(error);
	}
};

export const postBackup = async () => {
	try {
		const response: Response = await fc().post(`/api/Db/Backup`);
		return await ensureOk(response).text();
	}
	catch (error) {
		console.error(error);
	}
};

export const postRestore = async (fileName: string) => {
	try {
		const response: Response = await fc().post(`/api/Db/Restore?${new URLSearchParams({ fileName })}`);
		return await ensureOk(response).text();
	}
	catch (error) {
		console.error(error);
	}
};

export const postDelete = async (fileName: string) => {
	try {
		const response: Response = await fc().post(`/api/Db/Delete?${new URLSearchParams({ fileName })}`);
		return await ensureOk(response).text();
	}
	catch (error) {
		console.error(error);
	}
};
