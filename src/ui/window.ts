import MapSelection from "../helpers/mapSelection";
import { proxifyPaths, removeProxiedPaths } from "../helpers/proxyPather";
import { SelectedPaths } from "../helpers/selectedPaths";
import { error, isDebugMode, log } from "../helpers/utilityHelpers";
import MapSelectionTool from "../tools/mapSelectionTool";
import pluginVersion from "../version";


// Settings for the window
const windowId = "proxy-pather-window";
const checkboxSmoothId = 'proxy-pather-smooth-edges';
const buttonAddId = "proxy-pather-add-button";
const buttonRemoveId = "proxy-pather-remove-button";
const widgetLineHeight = 14;


type ToolMode = "off" | "add" | "remove";


/**
 * Controls the proxy pather window.
 */
class ProxyPatherWindow
{
	private _tool = new MapSelectionTool("proxy-pather", "path_down");
	private _toolMode: ToolMode = "off";


	/**
	 * Controls the proxy pather window.
	 */
	constructor()
	{
		this._tool.onSelect = s => this.onUseTool(s);
	}


	/**
	 * Opens the window for the proxy pather tool.
	 */
	open()
	{
		const window = ui.getWindow(windowId);
		if (window)
		{
			log("The proxy pather window is already shown.");
			window.bringToFront();
		}
		else
		{
			let windowTitle = `Proxy Pather (v${pluginVersion})`;
			if (isDebugMode)
			{
				windowTitle += " [DEBUG]";
			}

			ui.openWindow({
				classification: windowId,
				title: windowTitle,
				width: 260,
				height: 90,
				onClose: () => this.deactivate(),
				widgets: [
					<ButtonWidget>{
						name: buttonAddId,
						type: 'button',
						x: 30,
						y: 37,
						width: 100,
						height: 30,
						text: "Proxify",
						onClick: () => this.toggle("add")
					},
					<ButtonWidget>{
						name: buttonRemoveId,
						type: 'button',
						x: 135,
						y: 37,
						width: 100,
						height: 30,
						text: "Remove",
						onClick: () => this.toggle("remove")
					},
					<CheckboxWidget>{
						name: checkboxSmoothId,
						type: 'checkbox',
						x: 35,
						y: 20,
						width: 100,
						height: widgetLineHeight,
						text: "Smooth edges",
					},
					<LabelWidget>{
						type: 'label',
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

		this.setTool("add");
	}


	/**
	 * Closes the window for the proxy pather tool.
	 */
	close()
	{
		ui.closeWindows(windowId);
		this.deactivate();
	}


	/**
	 * Toggles the specified tool mode on or off based on the internal state.
	 */
	private toggle(mode: ToolMode)
	{
		this.setTool((this._toolMode != mode) ? mode : "off");
	}


	/**
	 * Turns the tool on or off.
	 *
	 * @param value True to enable to tool, false to disable it.
	 */
	private setTool(mode: ToolMode)
	{
		this._toolMode = mode;

		const window = ui.getWindow(windowId);
		if (!window)
		{
			return;
		}

		const buttonAdd = window.findWidget<ButtonWidget>(buttonAddId);
		const buttonRemove = window.findWidget<ButtonWidget>(buttonRemoveId);
		buttonAdd.isPressed = (mode === "add");
		buttonRemove.isPressed = (mode === "remove");

		if (mode === "off")
		{
			this._tool.deactivate();
		}
		else
		{
			this._tool.activate();
		}
	}


	/**
	 * Callback for when the tool gets used.
	 * 
	 * @param selection The map area selected by the tool.
	 */
	private onUseTool(selection: MapSelection)
	{
		const range = selection.toMapRange();
		if (range)
		{
			switch (this._toolMode)
			{
				case "add":
					const smoothEdges = this.getSmoothEdgesSetting();
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
	private deactivate()
	{
		this._tool.deactivate();
	}


	/**
	 * Gets the currently selected setting for smooth path edges.
	 */
	private getSmoothEdgesSetting(): boolean
	{
		const window = ui.getWindow(windowId);
		const checkbox = window?.findWidget<CheckboxWidget>(checkboxSmoothId);

		if (!window || !checkboxSmoothId)
		{
			error("Could not find smooth edges checkbox!");
			return false;
		}

		return checkbox.isChecked;
	}
}

export default ProxyPatherWindow;
