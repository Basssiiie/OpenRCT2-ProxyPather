import { log, mapTileSize } from "./utilityHelpers";



/**
 * Specifies all paths on the specified tile.
 */
export interface TilePaths
{
	data: Tile;
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
	baseHeight: number;
	clearanceHeight: number;
	isHidden: boolean;
}


/**
 * Definition of all selected paths in an area on the map.
 */
export class SelectedPaths
{
	tiles: TilePaths[][];

	get width()
	{
		return this.tiles.length;
	}	
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
	constructor(range: MapRange, readonly padding: number = 1)
	{
		this.tiles = [];

		const left = (range.leftTop.x / mapTileSize) - padding;
		const right = (range.rightBottom.x / mapTileSize) + padding;
		const top = (range.leftTop.y / mapTileSize) - padding;
		const bottom = (range.rightBottom.y / mapTileSize) + padding;

		log (`Selection = ${JSON.stringify(range)}`);

		for (let x = left; x <= right; x++)
		{
			const row: TilePaths[] = [];

			for (let y = top; y <= bottom; y++)
			{
				const tile = map.getTile(x, y);
				const paths = this.getPathsOnTile(tile);

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
		const width = (this.width - (this.padding * 2));
		const height = (this.height - (this.padding * 2));

		for (let x = this.padding; x <= width; x++)
		{
			for (let y = this.padding; y <= height; y++)
			{
				callback(x, y, this.tiles);
			}
		}
	}


	/**
	 * Find all path elements on this tile and group them together if they are simply 
	 * layers at the same height.
	 * 
	 * @param tile The tile for which to get all path elements.
	 */
	private getPathsOnTile(tile: Tile): Path[]
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
				
				if (layer.type != "footpath" || layer.baseHeight != height)
					break;

				pathLayers++;
			}

			paths.push({ 
				startIndex: start, 
				layerCount: pathLayers,

				baseHeight: height,
				clearanceHeight: element.clearanceHeight,
				isHidden: element.isHidden,
				object: (element as FootpathElement).object,
			});
		}
		return paths;
	}
}