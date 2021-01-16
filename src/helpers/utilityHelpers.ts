/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== 'undefined');


/**
 * Returns true if debug mode is enabled, or false otherwise.
 */
export const isDebugMode = true;


/**
 * The size of a single map tile in coordinates.
 */
export const mapTileSize = 32;


/**
 * Logs a message is debug mode is enabled, or does nothing otherwise.
 *
 * @param message The error message to be logged.
 */
export function log(message: string): void
{
	if (isDebugMode)
	{
		console.log(message);
	}
}


/**
 * Logs an error message with an optional method name for specifying the origin.
 *
 * @param message The error message to be logged.
 * @param method The method specifying where the error occured.
 */
export function error(message: string, method?:string): void
{
	console.log((method)
		? `Error (${method}): ${message}`
		: `Error: ${message}`);
}


// The flag for gridlines on the map.
const ViewportFlagGridlines = (1 << 7);


/**
 * Toogles the map grid overlay on or off.
 * 
 * @param value True for on, false for off.
 */
export function toggleGridOverlay(value: boolean)
{
	if (value)
	{
		ui.mainViewport.visibilityFlags |= ViewportFlagGridlines;
	}
	else
	{
		ui.mainViewport.visibilityFlags &= ~(ViewportFlagGridlines);
	}
}