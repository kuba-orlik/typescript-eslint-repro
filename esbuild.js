const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const glob = require("tiny-glob");

const watch = process.argv.at(-1) === "--watch";

(async () => {
	let entryPoints = Object.fromEntries(
		(await glob("./src/back/**/*.ts")).map((e) => [
			e.replace(/\.ts$/, ""),
			e,
		])
	);
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
		entryPoints: ["./src/front/main.scss"],
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
