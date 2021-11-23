import { debug } from "../helpers/logger";
import { MapSelection } from "../helpers/mapSelection";


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


	private isDragging = false;
	private selection: (MapSelection | null) = null;


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
	activate()
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
			onStart: () => { },
			onDown: a => this.down(a),
			onUp: a => this.up(a),
			onMove: a => this.move(a),
			onFinish: () => this.finish()
		});

		debug(`Tool: activated.`);
	}


	/**
	 * Disables the tool if it is still active.
	 */
	deactivate()
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


	/**
	 * Callback for when the tool is finished.
	 */
	private finish()
	{
		toggleGridOverlay(false);

		if (this.onCancel)
		{
			this.onCancel();
		}
	}


	/**
	 * Starts selecting when the user starts pressing down.
	 */
	private down(args: ToolEventArgs)
	{
		const location = args.mapCoords;
		if (!location)
		{
			debug(`Tool: down at unknown location.`);
			return;
		}

		debug(`Tool: down at ${JSON.stringify(location)}.`);

		this.isDragging = true;

		this.selection = new MapSelection();
		this.selection.start = location;
	}



	/**
	 * Finishes selecting when the user releases the mouse button.
	 */
	private up(args: ToolEventArgs)
	{
		const location = args.mapCoords;
		if (!location)
		{
			debug(`Tool: up at unknown location.`);
			return;
		}

		debug(`Tool: up at ${JSON.stringify(location)}.`);

		if (this.selection && this.onSelect)
		{
			this.onSelect(this.selection);
		}
		this.selection = null;

		// @ts-expect-error
		ui.tileSelection.range = null;
	}


	/**
	 * Updates the grid every time the selection is moved.
	 */
	private move(args: ToolEventArgs)
	{
		if (!this.isDragging || !this.selection)
		{
			return;
		}

		const location = args.mapCoords;
		if (!location)
		{
			return;
		}

		this.selection.end = location;
		const range = this.selection.toMapRange();

		if (range)
		{
			ui.tileSelection.range = range;
		}
	}
}



// The flag for gridlines on the map.
const ViewportFlagGridlines = (1 << 7);


/**
 * Toogles the map grid overlay on or off.
 * @param value True for on, false for off.
 */
function toggleGridOverlay(value: boolean)
{
	if (value)
	{
		ui.mainViewport.visibilityFlags |= ViewportFlagGridlines;
	}
	else
	{
		ui.mainViewport.visibilityFlags &= ~(ViewportFlagGridlines);
	}
}