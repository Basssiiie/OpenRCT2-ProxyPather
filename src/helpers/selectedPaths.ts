import { copyPathData, PathLayers, Slope, TilePaths } from "./paths";

/**
 * The size of a single map tile in coordinates.
 */
const mapTileSize = 32;


/**
 * Definition of all selected paths in an area on the map.
 */
export class SelectedPaths
{
	/**
	 * Gets the selected tile information on the map.
	 */
	tiles: TilePaths[][];


	/**
	 * Gets the amount of tiles selected on the X axis.
	 */
	get width(): number
	{
		return this.tiles.length;
	}


	/**
	 * Gets the amount of tiles selected on the Y axis.
	 */
	get height(): number
	{
		return (this.tiles.length > 0) ? this.tiles[0].length : 0;
	}


	/**
	 * Selects all paths in the specified range, with optional padding around it.
	 *
	 * @param range The map range to get the paths from.
	 * @param padding Amount of tiles around the specified range to select as well.
	 */
	constructor(range: MapRange, readonly padding: number = 0)
	{
		this.tiles = [];

		const left = (range.leftTop.x / mapTileSize) - padding;
		const right = (range.rightBottom.x / mapTileSize) + padding;
		const top = (range.leftTop.y / mapTileSize) - padding;
		const bottom = (range.rightBottom.y / mapTileSize) + padding;

		for (let x = left; x <= right; x++)
		{
			const row: TilePaths[] = [];

			for (let y = top; y <= bottom; y++)
			{
				const tile = map.getTile(x, y);
				const paths = getPathsOnTile(tile);

				row.push({ data: tile, paths: paths });
			}
			this.tiles.push(row);
		}
	}


	/**
	 * Performs the specified action for each tile in the selection.
	 *
	 * @param callback The action to perform on each tile.
	 */
	forEach(callback:(x: number, y: number, tiles: TilePaths[][]) => void): void
	{
		const width = (this.width - this.padding);
		const height = (this.height - this.padding);

		for (let x = this.padding; x < width; x++)
		{
			for (let y = this.padding; y < height; y++)
			{
				callback(x, y, this.tiles);
			}
		}
	}
}


/**
 * Find all path elements on this tile and group them together if they are simply
 * layers at the same height.
 *
 * @param tile The tile for which to get all path elements.
 */
function getPathsOnTile(tile: Tile): PathLayers[]
{
	const elements = tile.elements;
	const count = elements.length;
	const paths: PathLayers[] = [];

	for (let i = 0; i < count; i++)
	{
		const element = elements[i];

		// Skip queue's for now as well..
		if (element.type != "footpath" || element.isQueue)
			continue;

		const height = element.baseHeight;
		const start = i;
		let pathLayers = 1;

		// Count how many layers this path has..
		while (++i < count)
		{
			const layer = elements[i];

			if (layer.type != "footpath")
				break;

			// If new path on a different height, re-check it later in the outer loop.
			if (layer.baseHeight != height)
			{
				i--;
				break;
			}
			pathLayers++;
		}

		// Create a layered path object.
		const layers = {
			startIndex: start,
			layerCount: pathLayers,
			slopeDirection: element.slopeDirection ?? Slope.Flat,
			isBaseHidden: element.isHidden,
			hasAddition: (element.addition !== null),
		} as PathLayers;

		copyPathData(element, layers);
		paths.push(layers);
	}
	return paths;
}