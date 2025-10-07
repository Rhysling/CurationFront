export const localStore = <T extends JsonValue | null>(key: string, initial: T | null) => {

	const toString = (val: T) => JSON.stringify(val);
	const toObj = JSON.parse;
	const isLocalStorage = !!(window && window.localStorage);

	const saveItem = (val: T | null) => {
		if (!isLocalStorage) return;

		if (!val) {
			localStorage.removeItem(key);
			return;
		}

		localStorage.setItem(key, toString(val));
	};


	const retrieveItem = (): T | null => {
		const v = localStorage.getItem(key);
		return v ? toObj(v) as T : null;
	}

	if (initial) {
		saveItem(initial);
	} else {
		initial = retrieveItem();
	}

	let lsv: T | null = $state(initial);

	return {
		get value(): T | null {
			return lsv;
		},
		set value(newValue: T | null) {
			saveItem(newValue);
			lsv = newValue;
		},
	}
}
