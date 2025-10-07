import type { AxiosResponse } from "axios";
import { getHttpClient as ax } from "../stores/httpclient-store.svelte";

export const postLogin = async (userLogin: UserLogin) => {
	try {
		const response: AxiosResponse<UserClientRemote | undefined> = await ax().post("/api/Login", userLogin);
		return response.data;
	}
	catch (error) {
		console.error(error);
	}
};


export const getSecuredValue = async () => {
	try {
		const response: AxiosResponse<string> = await ax().get("/api/Test/GetSecuredValue");
		return response;
	} catch (error) {
		console.error(error);
	}
}

export const getAdminValue = async () => {
	try {
		const response: AxiosResponse<string> = await ax().get("/api/Test/GetAdminValue");
		return response;
	} catch (error) {
		console.error(error);
	}
}

// ax()
// 		.post("/api/Login", userLogin)
// 		.then(function (response: AxiosResponse<UserClientRemote>) {
// 			user.value = response.data;
// 			resetUserLogin();
// 			isOpen = false;
// 		})
// 		.catch(function (error) {
// 			if (error?.response?.status) {
// 				let s = +error.response.status;
// 				submitErrorMessage =
// 					s >= 400 && s < 500
// 						? "Email/password incorrect."
// 						: "Something went wrong.";
// 			} else {
// 				submitErrorMessage = "Something went wrong.";
// 			}
// 		});
// 		}

// const getUsersFeeds = async () => {
// 	try {
// 		const response: AxiosResponse<IUsersFeedsVM> = await $ax.get(
// 			"/api/Stats/UsersFeeds",
// 		);
// 		ufvm = response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// const getFeedsAsync = async (uid: string) => {
// 	try {
// 		const response: AxiosResponse<IFeed[]> = await $ax.get(
// 			`/api/User/GetFeedsForUser/${uid}`,
// 		);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// };