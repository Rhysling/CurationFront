import { localStore } from './localstorage-store.svelte';

const getEmptyUserSettings = () => {
	const us: UserSettings = {
		isNewestFirst: false,
	};

	return { ...us };
};

const usStore = localStore<UserSettings>("userSettings", null);

if (!usStore.value) usStore.value = getEmptyUserSettings();

export const userSettings = {
	get value(): UserSettings {
		return usStore.value || getEmptyUserSettings();
	},
	set value(newValue: UserSettings) {
		usStore.value = newValue;
	},
};

export const setIsNewestFirst = (newVal: boolean) => {
	usStore.value = { ...usStore.value, isNewestFirst: newVal };
};