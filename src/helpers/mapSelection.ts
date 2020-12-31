import { error } from "./utilityHelpers";

const MapTileSize = 32;


/**
 * Class to specify an area on the map.
 */
class MapSelection
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


	/**
	 * Performs the specified action for each tile in the selection.
	 * 
	 * @param callback The action to perform on each tile.
	 */
	forEach(callback: (tile: Tile) => void)
	{
		const range = this.toMapRange();
		if (!range)
		{
			return;
		}

		for (let x = range.leftTop.x; x <= range.rightBottom.x; x += MapTileSize)
		{
			for (let y = range.leftTop.y; y <= range.rightBottom.y; y += MapTileSize)
			{
				const tile = map.getTile(x / MapTileSize, y / MapTileSize);
				callback(tile);
			}
		}
	}
}

export default MapSelection;
