import { isUiAvailable } from "./helpers/environment";
import { debug } from "./helpers/logger";
import { ProxyPatherWindow } from "./ui/window";


const window = new ProxyPatherWindow();


/**
 * Entry point of the plugin.
 */
export function main()
{
	debug("Plugin started.");

	if (!isUiAvailable || network.mode != "none")
	{
		return;
	}

	ui.registerMenuItem("Proxy Pather", () => window.open());
};
