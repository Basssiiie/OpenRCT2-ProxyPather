import { isUiAvailable, log } from './helpers/utilityHelpers';
import ProxyPatherWindow from './ui/window';


const window = new ProxyPatherWindow();


/**
 * Entry point of the plugin.
 */
function main()
{
	log("Plugin started.");

	if (!isUiAvailable) {
		return;
	}

	ui.registerMenuItem("Proxy Pather", () => window.open());	
};

export default main;
