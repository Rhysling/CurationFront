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
	}
});
