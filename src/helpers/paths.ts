
/**
 * Specifies all paths on the specified tile.
 */
export interface TilePaths
{
	data: Readonly<Tile>;
	paths: PathLayers[];
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
 * Definition of a specific (potentially layered) path.
 */
export interface PathLayers extends PathObject
{
	startIndex: number;
	layerCount: number;

	slopeDirection: Slope;
	isBaseHidden: boolean;
}


/**
 * Information about the path object.
 */
export interface PathObject
{
	object: number;
	surfaceObject: number;
	railingsObject: number;
	baseHeight: number;
	clearanceHeight: number;
}


/**
 * Copies height and object information from one object to another.
 */
export function copyPathData(from: PathObject, to: Partial<PathObject>): void
{
	to.baseHeight = from.baseHeight;
	to.clearanceHeight = from.clearanceHeight;
	to.object = from.object;
	to.surfaceObject = from.surfaceObject;
	to.railingsObject = from.railingsObject;
}