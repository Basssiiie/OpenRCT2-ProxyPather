import { findSingleIndex } from "./utilityHelpers";


/**
 * Tries to insert a proxy path into the specified tile. The proxy path
 * will hide the current path and add the fake path on top of it.
 * 
 * @param tile The tile to add the proxy path to.
 */
export function tryInsertProxyPath(tile: Tile)
{
	const index = findSingleIndex(tile.elements, e => e.type == "footpath");
	if (index == -1)
	{
		return;
	}

	const path = tile.getElement<FootpathElement>(index);

	const baseHeight = path.baseHeight;
	const clearance = path.clearanceHeight;
	const pathType = path.object;

	path.isHidden = true;

	const proxyPath = tile.insertElement(index + 2) as FootpathElement;
	proxyPath.type = "footpath";
	proxyPath.object = pathType;
	proxyPath.edges = 0xFF;
	proxyPath.corners = 0xFF; 
	proxyPath.baseHeight = baseHeight;
	proxyPath.clearanceHeight = clearance;
}
