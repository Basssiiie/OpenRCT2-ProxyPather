/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== 'undefined');


/**
 * Returns true if debug mode is enabled, or false otherwise.
 */
export const isDebugMode = true;


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


/**
 * Finds exactly one matching item in this array, if one is present.
 * Returns -1 if none or more than one are present.
 * 
 * @param array The array to search.
 * @param predicate The predicate to match all items against.
 */
export function findSingleIndex<T>(array: T[], predicate: (value: T) => boolean): number
{
	const length = array.length;
	let index: number = -1;

	for (let i = 0; i < length; i++)
	{
		const current = array[i];

		if (predicate(current))
		{
			if (index != -1)
			{
				return -1;
			}
			index = i;
		}
	}
	return index;
}
