export class LocalStore<T extends JsonValue> {
	value = $state<T>() as T;
	key = "";

	constructor(key: string, value: T) {
		this.key = key;
		this.value = value;

		if (window && window.localStorage) {
			const item = localStorage.getItem(key);
			if (item) this.value = this.toObj(item);
		}

		$effect.root(() => {
			$effect(() => {
				if (value !== undefined && value !== null) { // Only store if not null/undefined
					localStorage.setItem(this.key, this.toString(this.value));
				} else {
					localStorage.removeItem(key); // Remove if value becomes null/undefined
				}
			});
		});
	}

	toString(value: T): string {
		return JSON.stringify(value, null, 2);
	}

	toObj(item: string): T {
		return JSON.parse(item);
	}
}

export function localStore<T extends JsonValue>(key: string, value: T) {
	return new LocalStore(key, value);
}
