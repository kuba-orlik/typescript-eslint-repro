const path = require("path");

module.exports = [
	{
		name: "front-end-components",
		entry: {
			bundle: "./src/front/index.js",
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
				{
					test: /\.ts$/,
					exclude: [/node_modules/],
					use: [{ loader: "ts-loader" }],
				},
			],
		},
	},
];
