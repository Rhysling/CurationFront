import axios from "axios";
import { user } from "./user-store.svelte";

declare var baseURL: string;

const httpClient = $derived.by(() => {

	let opts = { baseURL };

	if (user.value?.token)
		opts = { ...opts, ...{ headers: { Authorization: `Bearer ${user.value.token}` } } };

	let instance = axios.create(opts);

	instance.interceptors.response.use(
		res => res,
		err => {
			// if (err.response.status === 401)
			//   user.logout();

			return Promise.reject(err);
		}
	);

	return instance;

});

export const getHttpClient = () => httpClient;
export const getBaseURL = () => baseURL;