import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();

vi.mock('../stores/fetchclient-store.svelte', () => ({
	getFetchClient: () => ({ get: mockGet } as unknown as any),
}));

import { getPicPublicList } from './db-ops';

describe('getPicPublicList', () => {
	beforeEach(() => {
		mockGet.mockReset();
	});

	it('calls the correct endpoint and returns the response', async () => {
		const fakeData: PictureItem[] = [
			{ id: 1, fileName: 'photo.jpg', seq: 1, ts: 0, title: null, description: null, keywords: [], keywordsAll: undefined, link: null, isMissing: false, isDeleted: false, isRss: false },
		];
		mockGet.mockResolvedValue({ ok: true, json: () => Promise.resolve(fakeData) });

		const result = await getPicPublicList();

		expect(mockGet).toHaveBeenCalledWith('/api/Pictures/GetPublicList');
		expect(result).toEqual(fakeData);
	});

	it('returns undefined instead of the error body on a non-2xx response', async () => {
		mockGet.mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error', json: () => Promise.resolve({ title: 'boom' }) });
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getPicPublicList();

		expect(result).toBeUndefined();
	});
});
