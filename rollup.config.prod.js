import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './src/registerPlugin.ts',
	output: {
		file: './dist/ProxyPather.js',
		format: 'iife',
	},
	plugins: [
		typescript(),
		terser({
			format: {
				quote_style: 1,
				wrap_iife: true,
				preamble: '// Get the latest version: https://github.com/Basssiiie/OpenRCT2-ProxyPather',
			},
		}),
	],
};
