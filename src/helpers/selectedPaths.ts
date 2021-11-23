/**
 * The size of a single map tile in coordinates.
 */
const mapTileSize = 32;


/**
 * Specifies all paths on the specified tile.
 */
export interface TilePaths
{
	data: Readonly<Tile>;
	paths: Path[];
}


/**
 * Definition of a specific (potentially layered) path.
 */
export interface Path
{
	startIndex: number;
	layerCount: number;

	object: number;
	slopeDirection: Slope;
	baseHeight: number;
	clearanceHeight: number;
	isHidden: boolean;
}


/**
 * Possible slope directions a path can have.
 */
export const enum Slope
{
	Flat = -1,
	NorthEast = 0,
	SouthEast = 1,
	SouthWest = 2,
	NorthWest = 3,
	Count = 4 // amount of different slopes
}


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
	get width()
	{
		return this.tiles.length;
	}


	/**
	 * Gets the amount of tiles selected on the Y axis.
	 */
	get height()
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
	forEach(callback:(x: number, y: number, tiles: TilePaths[][]) => void)
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
function getPathsOnTile(tile: Tile): Path[]
{
	const elements = tile.elements;
	const count = elements.length;
	const paths: Path[] = [];

	for (let i = 0; i < count; i++)
	{
		const element = elements[i];

		if (element.type != "footpath")
			continue;

		const height = element.baseHeight;
		const start = i;
		let pathLayers = 1;

		// Count how many layers this path has..
		for (; ++i < count;)
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
		const realPath = element as FootpathElement;

		paths.push({
			startIndex: start,
			layerCount: pathLayers,

			baseHeight: height,
			clearanceHeight: realPath.clearanceHeight,
			slopeDirection: realPath.slopeDirection ?? Slope.Flat,
			isHidden: realPath.isHidden,
			object: realPath.object,
		});
	}
	return paths;
}