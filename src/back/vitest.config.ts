import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		testTimeout: 10000,
		setupFiles: ["src/back/test-teardown.ts"],
		exclude: ["docker_node_modules", "node_modules", "dist", "lib"],
		globals: true,
		coverage: {
			exclude: ["docker_node_modules", "node_modules", "dist", "lib"],
			enabled: true,
			all: true,
			include: ["src/**", "test?(-*).?(c|m)[jt]s?(x)"],
		},
	},
});
