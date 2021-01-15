import { Path, SelectedPaths, TilePaths } from "./selectedPaths";
import { log } from "./utilityHelpers";


/**
 * Tries to insert proxy paths onto all paths on the selected tiles. The proxy path will 
 * hide the current path and add the fake path on top of it.
 * 
 * @param selection A map of selected paths in an area.
 * @param smoothEdges Whether to make the path edges smooth depending on neighbouring tiles.
 */
export function proxifyPaths(selection: SelectedPaths, smoothEdges: boolean)
{
	let count = 0;
	selection.forEach((x, y, tiles) =>
	{
		const tile = tiles[x][y];

		// Go through all paths on this tile from top to bottom to prevent element re-order.
		for (let i = tile.paths.length - 1; i >= 0; i--)
		{
			const pathInfo = tile.paths[i];
			let proxyPath;

			if (!isProxied(pathInfo))
			{
				// Skip paths with slopes; we do not proxy them.
				if (pathInfo.isSloped)
					continue;

				// Copy/paste the same path on top of it.
				proxyPath = addProxyPath(tile.data, pathInfo);
			}
			else
			{
				// Get the top path to update the edges only.
				const last = (pathInfo.startIndex + pathInfo.layerCount) - 1;
				proxyPath = tile.data.getElement<FootpathElement>(last);
			}

			if (smoothEdges) 
			{
				const sides = getPathSides(x, y, pathInfo.baseHeight, tiles);
				proxyPath.edges = sides;
				proxyPath.corners = sides >> 4;
			}	
			else 
			{
				proxyPath.edges = 0xFF;
				proxyPath.corners = 0xFF;
			}
			
			// Hide the original path.
			const originalPath = tile.data.getElement<FootpathElement>(pathInfo.startIndex);
			originalPath.isHidden = true;
			count++;
		}
	});
	
	log(`Proxy pathing applied to ${count} path elements.`);
}


/**
 * Removes all extra proxy layers that are present within the current selected area.
 * 
 * @param selection A map of selected paths in an area.
 */
export function removeProxiedPaths(selection: SelectedPaths)
{
	let count = 0;
	selection.forEach((x, y, tiles) =>
	{
		const tile = tiles[x][y];

		// Go through all paths on this tile from top to bottom to prevent element re-order.
		for (let i = tile.paths.length - 1; i >= 0; i--)
		{
			const pathInfo = tile.paths[i];

			if (!isProxied(pathInfo))
				continue;

			// Remove all proxy-layers from top to bottom to prevent element re-order.
			const firstProxy = (pathInfo.startIndex + 1);
			const lastProxy = (pathInfo.startIndex + pathInfo.layerCount) - 1;

			for (let j = lastProxy; j >= firstProxy; j--)
			{
				tile.data.removeElement(j);
			}

			// Hide the original path.
			const originalPath = tile.data.getElement<FootpathElement>(pathInfo.startIndex);
			originalPath.isHidden = false;
			count++;
		}
	});
	
	log(`Proxy pathing removed from ${count} path elements.`);
}


/**
 * Add a proxy path to the specified tile.
 * 
 * @param tile The tile to add the proxy path to.
 * @param path The path to proxify.
 */
function addProxyPath(tile: Tile, path: Path) 
{
	const proxyPath = tile.insertElement(path.startIndex + 1) as FootpathElement;

	proxyPath.type = "footpath";
	proxyPath.baseHeight = path.baseHeight;
	proxyPath.clearanceHeight = path.clearanceHeight;
	proxyPath.object = path.object;
	return proxyPath;
}


/**
 * Returns true if this path is already proxied, or false if not.
 * 
 * @param path The path to check.
 */
function isProxied(path: Path): boolean
{
	return (path.layerCount > 1);
}


/**
 * Gets the path connection flags for all edges and corners around the specified 
 * path position.
 * 
 * @param x X position where the path is located.
 * @param y Y position where the path is located.
 * @param z Z position where the path is located.
 * @param tiles The tile-map where the other paths are stored.
 */
function getPathSides(x: number, y: number, z: number, tiles:TilePaths[][]): number
{
	let sides: number = 0;

	if (hasPathAtHeight(tiles[x - 1][y], z)) 
		sides |= Edge.NorthEast;
	if (hasPathAtHeight(tiles[x][y + 1], z)) 
		sides |= Edge.SouthEast;
	if (hasPathAtHeight(tiles[x + 1][y], z)) 
		sides |= Edge.SouthWest;
	if (hasPathAtHeight(tiles[x][y - 1], z)) 
		sides |= Edge.NorthWest;

	if ((sides & Edge.North) === Edge.North && hasPathAtHeight(tiles[x - 1][y - 1], z)) 
		sides |= Corner.North;
	if ((sides & Edge.East) === Edge.East && hasPathAtHeight(tiles[x - 1][y + 1], z)) 
		sides |= Corner.East;
	if ((sides & Edge.South) === Edge.South && hasPathAtHeight(tiles[x + 1][y + 1], z)) 
		sides |= Corner.South;
	if ((sides & Edge.West) === Edge.West && hasPathAtHeight(tiles[x + 1][y - 1], z))
		sides |= Corner.West;

	return sides;

}


/**
 * Checks whether there is a path on the specified tile at the requested height.
 * 
 * @param tile The tile to search for path elements.
 * @param height The height at which the path needs to be.
 */
function hasPathAtHeight(tile:TilePaths, height: number): boolean
{
	for (let i = 0; i < tile.paths.length; i++)
	{
		if (tile.paths[i].baseHeight === height)
			return true;
	}
	return false;
}


/**
 * All possible edges of paths in the game.
 */
const enum Edge {
	NorthEast = (1 << 0),
	SouthEast = (1 << 1),
	SouthWest = (1 << 2),
	NorthWest = (1 << 3),

	// Shortcuts to check if it is necessary to check corners.
	East =  (NorthEast | SouthEast),
	South = (SouthEast | SouthWest),
	West =  (SouthWest | NorthWest),
	North = (NorthWest | NorthEast)
}


/**
 * All possible corners of paths in the game.
 */
const enum Corner
{
	East =  (1 << 4),
	South = (1 << 5),
	West =  (1 << 6),
	North = (1 << 7)
}