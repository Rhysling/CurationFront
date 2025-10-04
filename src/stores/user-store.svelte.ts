import { localStore } from './localstorage-store.svelte';

const getEmptyUser = () => {
	const u: UserClientRemote = {
		id: 0,
		email: "",
		fullName: "",
		token: "",
		isAdmin: false,
		isDisabled: false,
		isDeleted: false,
	};

	return { ...u };
};

const uStore = localStore<UserClientRemote>("user", getEmptyUser());
const isLoggedIn = $derived(uStore.value.token !== "");

export const user = {
	...uStore,
	logOut: () => uStore.value = getEmptyUser()
};

export const getIsLoggedIn = () => isLoggedIn;