const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const glob = require("tiny-glob");

const watch = process.argv.includes("--watch");

(async () => {
	const entryPoints = await glob("./src/back/**/*.ts");
	build({
		entryPoints,
		sourcemap: true,
		outdir: "./dist",
		logLevel: "info",
		platform: "node",
		watch,
		target: "node16",
		format: "cjs",
	});
	build({
		entryPoints: ["./src/main.scss"],
		sourcemap: true,
		outfile: "./public/dist/style.css",
		logLevel: "info",
		watch,
		plugins: [sassPlugin()],
	});
	build({
		entryPoints: ["./src/front/index.ts"],
		sourcemap: true,
		outfile: "./public/dist/bundle.js",
		logLevel: "info",
		bundle: true,
		watch,
	});
})();
