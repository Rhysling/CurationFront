import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
	plugins: [svelte()],
	server: {
		port: 5050
	},
	test: {
		environment: 'jsdom',
		globals: true,
		// The default pool fails every suite here ("Vitest failed to find the current
		// suite") with vitest 5.1.1 on Node 24; the vm pool works.
		pool: 'vmThreads',
	}
});
