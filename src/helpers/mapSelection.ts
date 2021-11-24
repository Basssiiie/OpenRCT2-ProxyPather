import { error } from "./logger";


/**
 * Class to specify an area on the map.
 */
export interface MapSelection
{
	start: CoordsXY;
	end?: CoordsXY;
}

/**
 * Converts the selection to a OpenRCT2 compatible MapRange object.
 */
export function toMapRange(selection: MapSelection): MapRange | null
{
	if (!selection.start || !selection.end)
	{
		error("Selection is incomplete.");
		return null;
	}

	return {
		leftTop: {
			x: Math.min(selection.start.x, selection.end.x),
			y: Math.min(selection.start.y, selection.end.y)
		},
		rightBottom: {
			x: Math.max(selection.start.x, selection.end.x),
			y: Math.max(selection.start.y, selection.end.y)
		}
	};
}