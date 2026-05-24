import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosInstance } from 'axios';

const mockGet = vi.fn();

vi.mock('../stores/httpclient-store.svelte', () => ({
	getHttpClient: () => ({ get: mockGet } as unknown as AxiosInstance),
}));

import { getPicPublicList } from './db-ops';

describe('getPicPublicList', () => {
	beforeEach(() => {
		mockGet.mockReset();
	});

	it('calls the correct endpoint and returns the response', async () => {
		const fakeData: PictureItem[] = [
			{ id: 1, fileName: 'photo.jpg', seq: 1, ts: 0, keywords: [], description: null, link: null, isMissing: false, isDeleted: false },
		];
		mockGet.mockResolvedValue({ status: 200, data: fakeData });

		const result = await getPicPublicList();

		expect(mockGet).toHaveBeenCalledWith('/api/Pictures/GetPublicList');
		expect(result?.data).toEqual(fakeData);
	});
});
