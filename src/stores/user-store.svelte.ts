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

const uStore = localStore<UserClientRemote>("user", null);

if (!uStore.value) uStore.value = getEmptyUser();

const isLoggedIn = $derived(!!uStore.value?.token);
const userName = $derived(uStore.value?.fullName || uStore.value?.email);

export const user = {
	get value(): UserClientRemote {
		return uStore.value || getEmptyUser();
	},
	set value(newValue: UserClientRemote) {
		uStore.value = newValue;
	},
};

export const logOut = () => user.value = { ...getEmptyUser() };
export const getIsLoggedIn = () => isLoggedIn;
export const getName = () => userName;