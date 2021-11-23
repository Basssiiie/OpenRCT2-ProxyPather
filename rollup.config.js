import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import getPath from "platform-folders";


// Environment variables
const build = process.env.BUILD || "development";
const isDev = (build === "development");

const output = (isDev)
	? `${getPath("documents")}/OpenRCT2/plugin/ProxyPather.js`
	: "./dist/ProxyPather.js";


/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
	input: "./src/registerPlugin.ts",
	output: {
		file: output,
		format: "iife",
	},
	plugins: [
		typescript(),
		terser({
			compress: {
				passes: 5
			},
			format: {
				comments: false,
				quote_style: 1,
				wrap_iife: true,
				preamble: "// Get the latest version: https://github.com/Basssiiie/OpenRCT2-ProxyPather",

				beautify: isDev,
			},
			mangle: {
				properties: {
					regex: /^_/
				}
			},

			// Useful only for stacktraces:
			keep_fnames: isDev,
		}),
	],
};
export default config;