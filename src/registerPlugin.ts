/// <reference path="../lib/openrct2.d.ts" />

import main from './main';
import pluginVersion from './version';

registerPlugin({
	name: 'ProxyPather',
	version: pluginVersion,
	authors: ['Basssiiie'],
	type: 'local',
	licence: 'MIT',
	main,
});
