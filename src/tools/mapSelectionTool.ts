import { debug } from "../helpers/logger";
import { MapSelection, toMapRange } from "../helpers/mapSelection";


/**
 * Tool that can select an area.
 */
export class MapSelectionTool
{
	/**
	 * Event that triggers when an area is selected.
	 */
	onSelect?: (selection: MapSelection) => void;


	/**
	 * Event that triggers when the tool is canceled via the 'escape' key or
	 * when another tool is activated.
	 */
	onCancel?: () => void;


	_isDragging = false;
	_selection: (MapSelection | null) = null;


	/**
	 * Tool that allows selecting an area.
	 * @param name The name of the tool, used as a identifier.
	 * @param cursor The cursor to use for selection.
	 */
	constructor(readonly name: string, readonly cursor: CursorType)
	{
	}


	/**
	 * Sets this as the currently activated tool.
	 */
	activate(): void
	{
		const tool = ui.tool;

		if (tool && tool.id === this.name)
		{
			debug(`Tool: already active.`);
			return;
		}

		toggleGridOverlay(true);

		ui.activateTool({
			id: this.name,
			cursor: this.cursor,
			onDown: a => down(this, a),
			onUp: a => up(this, a),
			onMove: a => move(this, a),
			onFinish: () => finish(this.onCancel)
		});

		debug(`Tool: activated.`);
	}


	/**
	 * Disables the tool if it is still active.
	 */
	deactivate(): void
	{
		const tool = ui.tool;
		if (tool && tool.id === this.name)
		{
			tool.cancel();
			debug(`Tool: deactivated.`);
		}
		else
		{
			debug(`Tool: already deactivated.`);
		}
	}
}


/**
 * Callback for when the tool is finished.
 */
function finish(callback?: () => void): void
{
	toggleGridOverlay(false);
	if (callback)
	{
		callback();
	}
}


/**
 * Starts selecting when the user starts pressing down.
 */
function down(tool: MapSelectionTool, args: ToolEventArgs): void
{
	const location = args.mapCoords;
	if (!location)
	{
		debug(`Tool: down at unknown location.`);
		return;
	}

	debug(`Tool: down at ${JSON.stringify(location)}.`);

	tool._isDragging = true;

	tool._selection = { start: location };
}



/**
 * Finishes selecting when the user releases the mouse button.
 */
function up(tool: MapSelectionTool, args: ToolEventArgs): void
{
	const location = args.mapCoords;
	if (!location)
	{
		debug(`Tool: up at unknown location.`);
		return;
	}

	debug(`Tool: up at ${JSON.stringify(location)}.`);

	if (tool._selection && tool.onSelect)
	{
		tool.onSelect(tool._selection);
	}
	tool._selection = null;
	ui.tileSelection.range = null;
}


/**
 * Updates the grid every time the selection is moved.
 */
function move(tool: MapSelectionTool, args: ToolEventArgs): void
{
	if (!tool._isDragging || !tool._selection)
	{
		return;
	}

	const location = args.mapCoords;
	if (!location)
	{
		return;
	}

	tool._selection.end = location;
	const range = toMapRange(tool._selection);

	if (range)
	{
		ui.tileSelection.range = range;
	}
}



// The flag for gridlines on the map.
const viewportFlagGridlines = (1 << 7);


/**
 * Toogles the map grid overlay on or off.
 * @param value True for on, false for off.
 */
function toggleGridOverlay(value: boolean): void
{
	if (value)
	{
		ui.mainViewport.visibilityFlags |= viewportFlagGridlines;
	}
	else
	{
		ui.mainViewport.visibilityFlags &= ~(viewportFlagGridlines);
	}
}