import { defineConfig } from "vitest/config";

const exclude = ["docker_node_modules", "node_modules", "dist", "lib", "webhint"];

export default defineConfig({
	test: {
		testTimeout: 10000,
		setupFiles: ["src/back/test-teardown.ts"],
		exclude,
		globals: true,
		coverage: {
			exclude,
			enabled: true,
			all: true,
			include: ["src/**", "test?(-*).?(c|m)[jt]s?(x)"],
		},
		reporters: ["junit"],
		outputFile: ".xunit",
	},
});
