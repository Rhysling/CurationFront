import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../stores/user-settings-store.svelte', () => ({
	setIsNewestFirst: vi.fn(),
}));

vi.mock('../stores/route-store.svelte', () => ({
	updateQueryStringParam: vi.fn(),
}));

import { getEmptyPicItem, getEmptyUser, orderBySeq, orderByTs } from './utils';

describe('getEmptyPicItem', () => {
	it('returns a PictureItem with expected default values', () => {
		const item = getEmptyPicItem();
		expect(item).toEqual({
			id: 0,
			fileName: '',
			seq: 999,
			ts: 0,
			keywords: [],
			description: '',
			link: '',
			isMissing: false,
			isDeleted: false,
		});
	});
});

describe('getEmptyUser', () => {
	it('returns a UserClientRemote with expected default values', () => {
		const user = getEmptyUser();
		expect(user).toEqual({
			id: 0,
			email: '',
			fullName: '',
			token: '',
			isAdmin: false,
			isDisabled: false,
			isDeleted: false,
		});
	});
});

describe('ordering', () => {
	let items: PictureItem[];

	beforeEach(() => {
		items = [
			{ ...getEmptyPicItem(), id: 1, seq: 3, ts: 100 },
			{ ...getEmptyPicItem(), id: 2, seq: 1, ts: 300 },
			{ ...getEmptyPicItem(), id: 3, seq: 2, ts: 200 },
		];
	});

	it('orderBySeq sorts items ascending by seq', () => {
		orderBySeq(items);
		expect(items.map(i => i.seq)).toEqual([1, 2, 3]);
	});

	it('orderByTs sorts items descending by ts (newest first)', () => {
		orderByTs(items);
		expect(items.map(i => i.ts)).toEqual([300, 200, 100]);
	});
});
