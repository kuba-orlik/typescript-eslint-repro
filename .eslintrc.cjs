module.exports = {
	env: { node: true },
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "prettier"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:prettier/recommended",
	],
	parserOptions: {
		sourceType: "module",
		ecmaFeatures: {
			modules: true,
		},
		project: ["./tsconfig.json", "./tsconfig-back.json"],
	},
	rules: {
		"@typescript-eslint/no-unused-vars": [2, { varsIgnorePattern: "TempstreamJSX" }],
		"@typescript-eslint/require-await": 0,
		/* "jsdoc/require-description": 2, */
		"no-await-in-loop": 2,
		"@typescript-eslint/consistent-type-assertions": [1, { assertionStyle: "never" }],
		"no-console": [1, { allow: ["error"] }],
	},
	ignorePatterns: ["dist/*", "public/dist/*", "coverage/*", "webhint/*"],
	settings: { jsdoc: { mode: "typescript" } },
	overrides: [
		{
			files: ["*.subtest.ts", "*.test.ts"],
			rules: {
				"@typescript-eslint/no-unsafe-member-access": 0,
				"prefer-const": 0,
				"@typescript-eslint/no-unsafe-call": 0,
				"@typescript-eslint/no-unsafe-return": 0,
				"@typescript-eslint/no-unsafe-assignment": 0,
				"no-await-in-loop": 1, // sometimes it's easier to debug when requests run sequentially
			},
		},
	],
};
