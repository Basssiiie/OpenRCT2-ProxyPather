import { error } from "./utilityHelpers";


/**
 * Class to specify an area on the map.
 */
export class MapSelection
{
	start?: CoordsXY;
	end?: CoordsXY;


	/**
	 * Converts the selection to a OpenRCT2 compatible MapRange object.
	 */
	toMapRange(): MapRange | null
	{
		if (!this.start || !this.end)
		{
			error("Selection is incomplete.", "MapSelection.toMapRange");
			return null;
		}

		return {
			leftTop: {
				x: Math.min(this.start.x, this.end.x),
				y: Math.min(this.start.y, this.end.y)
			},
			rightBottom: {
				x: Math.max(this.start.x, this.end.x),
				y: Math.max(this.start.y, this.end.y)
			}
		}
	}
}
