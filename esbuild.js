const { build } = require("esbuild");
const { spawn } = require("child_process");
const { sassPlugin } = require("esbuild-sass-plugin");
const glob = require("tiny-glob");
const chokidar = require("chokidar");

const watch = process.argv.includes("--watch");

(async () => {
	const entryPoints = await glob("./src/back/**/*.ts");
	build({
		entryPoints,
		sourcemap: true,
		outdir: "./dist/back",
		logLevel: "info",
		platform: "node",
		watch,
		target: "node16",
		format: "cjs",
	});
	const scss_build = await build({
		entryPoints: ["./src/main.scss"],
		sourcemap: true,
		outfile: "./public/dist/style.css",
		logLevel: "info",
		incremental: watch,
		plugins: [sassPlugin()],
	});
	scss_build.rebuild();

	build({
		entryPoints: ["./src/front/index.ts"],
		sourcemap: true,
		outfile: "./public/dist/bundle.js",
		logLevel: "info",
		bundle: true,
		watch,
	});

	if (watch) {
		const scss_watcher = chokidar.watch("src", { ignoreInitial: true });
		scss_watcher.on("all", (_, path) => {
			if (path.endsWith(".scss")) {
				// refresh the list of all scss files in includes.scss
				spawn("./node_modules/.bin/sealgen", ["generate-scss-includes"]).on(
					"close",
					() => {
						scss_build.rebuild().catch(async (e) => {
							console.error(e);
							setTimeout(() => {
								scss_build.rebuild();
							}, 200);
						});
					}
				);
			}
		});
	}
})();
