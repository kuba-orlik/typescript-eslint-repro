const path = require("path");

module.exports = [
	{
		name: "front-end-components",
		entry: {
			bundle: "./src/front/index.ts",
		},

		output: {
			filename: "[name].js",
			path: path.resolve(__dirname, "public/dist"),
		},

		mode: "production",
		devtool: "source-map",

		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: [/node_modules/],
					use: [{ loader: "babel-loader" }],
				},
			],
		},
	},
];
