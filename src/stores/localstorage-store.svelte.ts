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


	// Runs at module load, so a malformed stored value must not throw.
	const retrieveItem = (): T | null => {
		if (!isLocalStorage) return null;

		try {
			const v = localStorage.getItem(key);
			return v ? toObj(v) as T : null;
		} catch (error) {
			console.error(`Discarding unreadable localStorage "${key}"`, error);
			localStorage.removeItem(key);
			return null;
		}
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
