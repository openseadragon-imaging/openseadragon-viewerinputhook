import OpenSeadragon from 'openseadragon';

/**
 * @file openseadragon-viewerinputhook.js
 * @version <%= pkg.version %>
 * @author Mark Salsbery <msalsbery@hotmail.com>
 *
 */

/**
 * @module openseadragon-viewerinputhook
 * @version <%= pkg.version %>
 * @requires module:openseadragon
 *
 */

export default (function (OSD, $) {
	if (!OSD.version || OSD.version.major < 1) {
		throw new Error(
			'OpenSeadragonViewerInputHook requires OpenSeadragon version 1.0.0+'
		);
	}

	/**
	 * Creates a new ViewerInputHook attached to the viewer.
	 *
	 * @method addViewerInputHook
	 * @memberof external:"OpenSeadragon.Viewer"#
	 * @param {Object} options
	 * @param {Object[]} [options.hooks]
	 * @returns {OpenSeadragonImaging.ViewerInputHook}
	 *
	 **/
	OSD.Viewer.prototype.addViewerInputHook = function (options) {
		options = options || {};
		options.viewer = this;
		return new $.ViewerInputHook(options);
	};

	/**
	 * Creates a new ViewerInputHook attached (optionally) to the viewer instance passed in the options parameter.
	 *
	 * @class ViewerInputHook
	 * @classdesc Provides hooks into the OpenSeadragon viewer event pipeline.
	 * @memberof OpenSeadragonImaging
	 * @param {Object} options
	 * @param {external:"OpenSeadragon.Viewer"} [options.viewer] - Reference to OpenSeadragon viewer to attach to.
	 * @param {Object[]} options.hooks
	 *
	 **/
	$.ViewerInputHook = function (options) {
		var curHook, curTracker;

		options = options || {};
		options.hooks = options.hooks || [];

		this.viewer = options.viewer || null;
		this.viewerTrackers = {};
		this.hooks = [];

		if (this.viewer) {
			this.viewerTrackers.viewer = this.viewer.innerTracker;
			this.viewerTrackers.viewer_outer = this.viewer.outerTracker;
		}

		for (curHook = 0; curHook < options.hooks.length; curHook++) {
			if (typeof options.hooks[curHook].tracker === 'string') {
				if (!this.viewer) {
					throw new Error('A viewer must be specified.');
				}
				curTracker = this.viewerTrackers[
					options.hooks[curHook].tracker
				];
				if (curTracker === undefined) {
					throw new Error(
						'Unknown tracker specified: ' +
							options.hooks[curHook].tracker
					);
				}
			} else {
				curTracker = options.hooks[curHook].tracker;
			}

			this.hooks.push({
				tracker: curTracker,
				handlerName: options.hooks[curHook].handler,
				origHandler: curTracker[options.hooks[curHook].handler],
				hookHandler: options.hooks[curHook].hookHandler
			});

			(function (_this, tracker, handler, hookHandler) {
				var origHandler = tracker[handler];
				tracker[handler] = function (event) {
					return _this._callHandlers(hookHandler, origHandler, event);
				};
			})(
				this,
				curTracker,
				options.hooks[curHook].handler,
				options.hooks[curHook].hookHandler
			);
		}
	};

	/**
	 * ViewerInputHook version.
	 * @member {Object} OpenSeadragonImaging.ViewerInputHook.version
	 * @static
	 * @property {String} versionStr - The version number as a string ('major.minor.revision').
	 * @property {Number} major - The major version number.
	 * @property {Number} minor - The minor version number.
	 * @property {Number} revision - The revision number.
	 */
	$.ViewerInputHook.version = '<%= pkg.version.obj %>';

	$.ViewerInputHook.prototype._callHandlers = function (
		hookHandler,
		origHandler,
		event
	) {
		var ret = hookHandler(event);
		if (origHandler && !event.stopHandlers) {
			ret = origHandler(event);
		}
		return event.stopBubbling ? false : ret;
	};

	/**
	 * Remove hooks and OpenSeadragon references. Call before
	 * OpenSeadragon.Viewer.destroy().
	 * @function OpenSeadragonImaging.ViewerInputHook.prototype#destroy
	 * @since 2.2.0
	 */
	$.ViewerInputHook.prototype.destroy = function () {
		while (this.hooks.length > 0) {
			let curHook = this.hooks.pop();
			curHook.tracker[curHook.handlerName] = curHook.origHandler;
		}

		if (this.viewer) {
			delete this.viewerTrackers.viewer;
			delete this.viewerTrackers.viewer_outer;
			this.viewer = null;
		}
	};

	return $.ViewerInputHook;
})(
	OpenSeadragon || window.OpenSeadragon,
	(window.OpenSeadragonImaging = window.OpenSeadragonImaging || {})
);
