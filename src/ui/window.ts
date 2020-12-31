import { tryInsertProxyPath } from "../helpers/proxyPather";
import { isDebugMode, log } from "../helpers/utilityHelpers";
import MapSelectionTool from "../tools/mapSelectionTool";
import pluginVersion from "../version";


// Settings for the window
const windowId = "proxy-pather-window";
const buttonId = "proxy-pather-button";
const widgetLineHeight = 14;


/**
 * Controls the proxy pather window.
 */
class ProxyPatherWindow
{
	private _tool = new MapSelectionTool("proxy-pather", "path_down");
	private _enabled = true;


	/**
	 * Controls the proxy pather window.
	 */
	constructor()
	{
		this._tool.onSelect = s =>
		{
			s.forEach(t => tryInsertProxyPath(t));
			log("Proxy pathing applied.");
		};
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
				height: 85,
				width: 260,
				onClose: () => this.deactivate(),
				widgets: [
					<ButtonWidget>{
						name: buttonId,
						type: 'button' as WidgetType,
						x: 60,
						y: 23,
						width: 140,
						height: 35,
						onClick: () => this.toggle()
					},
					<LabelWidget>{
						type: 'label' as WidgetType,
						x: 6,
						y: 65,
						width: 275,
						height: widgetLineHeight,
						text: "github.com/Basssiiie/OpenRCT2-ProxyPather",
						isDisabled: true
					},
				]
			});
		}

		this.toggle();
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
	 * Toggles the tool on or off based on the internal state.
	 */
	private toggle()
	{

		const window = ui.getWindow(windowId);
		if (!window)
		{
			return;
		}

		this._enabled = !this._enabled;

		const button = window.findWidget<ButtonWidget>(buttonId);
		button.isPressed = this._enabled;

		if (this._enabled)
		{
			button.text = "Activated";
			this._tool.activate();
		}
		else
		{
			button.text = "Deactivated";
			this._tool.deactivate();
		}
	}


	/**
	 * Deactivates the tool if it was still active.
	 */
	private deactivate()
	{
		this._tool.deactivate();
	}
}

export default ProxyPatherWindow;
