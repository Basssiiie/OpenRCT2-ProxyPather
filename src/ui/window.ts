import { MapSelection, toMapRange } from "../helpers/mapSelection";
import { proxifyPaths, removeProxiedPaths } from "../helpers/proxyPather";
import { SelectedPaths } from "../helpers/selectedPaths";
import { error, debug } from "../helpers/logger";
import { MapSelectionTool } from "../tools/mapSelectionTool";
import { isDevelopment, pluginVersion } from "../helpers/environment";


// Settings for the window
const windowId = "proxy-pather-window";
const checkboxSmoothId = "proxy-pather-smooth-edges";
const buttonAddId = "proxy-pather-add-button";
const buttonRemoveId = "proxy-pather-remove-button";
const widgetLineHeight = 14;


type ToolMode = "off" | "add" | "remove";

// Remember the selected option after closing and reopening the window.
let smoothEdgesOption: boolean = false;


/**
 * Controls the proxy pather window.
 */
export class ProxyPatherWindow
{
	_tool = new MapSelectionTool("proxy-pather", "path_down");
	_toolMode: ToolMode = "off";


	/**
	 * Controls the proxy pather window.
	 */
	constructor()
	{
		this._tool.onSelect = s => onUseTool(s, this._toolMode);
		this._tool.onCancel = () => setTool(this, "off");
	}


	/**
	 * Opens the window for the proxy pather tool.
	 */
	open()
	{
		const window = ui.getWindow(windowId);
		if (window)
		{
			debug("The proxy pather window is already shown.");
			window.bringToFront();
		}
		else
		{
			let windowTitle = `Proxy Pather (v${pluginVersion})`;
			if (isDevelopment)
			{
				windowTitle += " [DEBUG]";
			}

			ui.openWindow({
				classification: windowId,
				title: windowTitle,
				width: 260,
				height: 90,
				onClose: () => deactivate(this._tool),
				widgets: [
					<ButtonWidget>{
						name: buttonAddId,
						type: "button",
						x: 30,
						y: 37,
						width: 100,
						height: 30,
						text: "Proxify",
						onClick: () => toggle(this, "add")
					},
					<ButtonWidget>{
						name: buttonRemoveId,
						type: "button",
						x: 135,
						y: 37,
						width: 100,
						height: 30,
						text: "Remove",
						onClick: () => toggle(this, "remove")
					},
					<CheckboxWidget>{
						name: checkboxSmoothId,
						type: "checkbox",
						x: 35,
						y: 20,
						width: 100,
						height: widgetLineHeight,
						text: "Smooth edges",
						isChecked: smoothEdgesOption
					},
					<LabelWidget>{
						type: "label",
						x: 7,
						y: 72,
						width: 275,
						height: widgetLineHeight,
						text: "github.com/Basssiiie/OpenRCT2-ProxyPather",
						isDisabled: true
					},
				]
			});
		}

		setTool(this, "add");
	}


	/**
	 * Closes the window for the proxy pather tool.
	 */
	close()
	{
		deactivate(this._tool);
		ui.closeWindows(windowId);
	}
}


/**
 * Toggles the specified tool mode on or off based on the internal state.
 */
function toggle(window: ProxyPatherWindow, mode: ToolMode): void
{
	setTool(window, (window._toolMode != mode) ? mode : "off");
}


/**
 * Turns the tool on or off.
 *
 * @param value True to enable to tool, false to disable it.
 */
function setTool(window: ProxyPatherWindow, mode: ToolMode): void
{
	window._toolMode = mode;

	const instance = ui.getWindow(windowId);
	if (!instance)
	{
		return;
	}

	const buttonAdd = instance.findWidget<ButtonWidget>(buttonAddId);
	const buttonRemove = instance.findWidget<ButtonWidget>(buttonRemoveId);
	buttonAdd.isPressed = (mode === "add");
	buttonRemove.isPressed = (mode === "remove");

	debug(`Set tool mode to: '${mode}'`);

	if (mode === "off")
	{
		window._tool.deactivate();
	}
	else
	{
		window._tool.activate();
	}
}


/**
 * Callback for when the tool gets used.
 *
 * @param selection The map area selected by the tool.
 */
function onUseTool(selection: MapSelection, toolMode: ToolMode): void
{
	const range = toMapRange(selection);
	if (range)
	{
		switch (toolMode)
		{
			case "add":
				const smoothEdges = getSmoothEdgesSetting();
				const selectionPadding = (smoothEdges) ? 1 : 0;
				const pathsToProxy = new SelectedPaths(range, selectionPadding);

				proxifyPaths(pathsToProxy, smoothEdges);
				break;

			case "remove":
				const pathsToDeproxy = new SelectedPaths(range);

				removeProxiedPaths(pathsToDeproxy);
				break;
		}
	}
}


/**
 * Deactivates the tool if it was still active.
 */
function deactivate(tool: MapSelectionTool): void
{
	smoothEdgesOption = getSmoothEdgesSetting();

	tool.deactivate();
}


/**
 * Gets the currently selected setting for smooth path edges.
 */
function getSmoothEdgesSetting(): boolean
{
	const window = ui.getWindow(windowId);
	const checkbox = window?.findWidget<CheckboxWidget>(checkboxSmoothId);

	if (!window || !checkboxSmoothId)
	{
		error("Could not find smooth edges checkbox!");
		return false;
	}

	return (checkbox.isChecked === true);
}
