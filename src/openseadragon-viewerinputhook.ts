import OpenSeadragon from 'openseadragon';

// /**
//  * @namespace OpenSeadragonImaging
//  * @description Provides extensions to OpenSeadragon for image analysis applications.
//  * @see {@link https://github.com/openseadragon-imaging|OpenSeadragon Imaging}
//  */

/**
 * @module openseadragon-viewerinputhook
 * @version __PKG_VERSION__
 * @requires module:openseadragon
 */

/**
 * @file viewerinputhook.ts
 * @version __PKG_VERSION__
 * @author Mark Salsbery <msalsbery@hotmail.com>
 *
 */

declare module 'openseadragon' {
  interface Viewer {
    // eslint-disable-next-line no-unused-vars
    addViewerInputHook(options?: ViewerInputHookOptions): ViewerInputHook;
  }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  interface MouseTrackerEvent<T> {
    stopHandlers?: boolean;
    stopBubbling?: boolean;
  }
}

type ViewerTrackerName = 'viewer' | 'viewer_outer';
type ViewerTrackers = Record<
  ViewerTrackerName,
  OpenSeadragon.MouseTracker | null
>;

interface MouseTrackerEventMap {
  preProcessEventHandler: OpenSeadragon.PreProcessMouseTrackerEvent;
  enterHandler: OpenSeadragon.EnterLeaveMouseTrackerEvent;
  exitHandler: OpenSeadragon.EnterLeaveMouseTrackerEvent;
  leaveHandler: OpenSeadragon.EnterLeaveMouseTrackerEvent;
  overHandler: OpenSeadragon.EnterLeaveMouseTrackerEvent;
  outHandler: OpenSeadragon.EnterLeaveMouseTrackerEvent;
  moveHandler: OpenSeadragon.PointerMouseTrackerEvent;
  pressHandler: OpenSeadragon.PointerMouseTrackerEvent;
  releaseHandler: OpenSeadragon.ReleaseMouseTrackerEvent;
  nonPrimaryPressHandler: OpenSeadragon.NonPrimaryPressMouseTrackerEvent;
  nonPrimaryReleaseHandler: OpenSeadragon.NonPrimaryPressMouseTrackerEvent;
  clickHandler: OpenSeadragon.ClickMouseTrackerEvent;
  dblClickHandler: OpenSeadragon.DblClickMouseTrackerEvent;
  contextMenuHandler: OpenSeadragon.ContextMenuMouseTrackerEvent;
  scrollHandler: OpenSeadragon.ScrollMouseTrackerEvent;
  keyDownHandler: OpenSeadragon.KeyMouseTrackerEvent;
  keyUpHandler: OpenSeadragon.KeyMouseTrackerEvent;
  keyHandler: OpenSeadragon.KeyMouseTrackerEvent;
  focusHandler: OpenSeadragon.MouseTrackerEvent<FocusEvent>;
  blurHandler: OpenSeadragon.MouseTrackerEvent<FocusEvent>;
  dragHandler: OpenSeadragon.DragMouseTrackerEvent;
  dragEndHandler: OpenSeadragon.DragEndMouseTrackerEvent;
  pinchHandler: OpenSeadragon.PinchMouseTrackerEvent;
  stopHandler: OpenSeadragon.StopMouseTrackerEvent;
}

type MouseTrackerHandlerName = Extract<
  keyof OpenSeadragon.MouseTracker,
  keyof MouseTrackerEventMap
>;

type MouseTrackerEvent = {
  [K in MouseTrackerHandlerName]: MouseTrackerEventMap[K];
}[MouseTrackerHandlerName];

type MouseTrackerEventHandler = {
  [K in MouseTrackerHandlerName]: OpenSeadragon.EventHandler<
    MouseTrackerEventMap[K]
  >;
}[MouseTrackerHandlerName];

type Hook = {
  [K in MouseTrackerHandlerName]: {
    tracker: OpenSeadragon.MouseTracker;
    handlerName: K;
    origHandler: MouseTrackerEventHandler | null;
    hookHandler: MouseTrackerEventHandler;
  };
}[MouseTrackerHandlerName];

export type OptionsHook = {
  [K in MouseTrackerHandlerName]: {
    tracker: ViewerTrackerName | OpenSeadragon.MouseTracker;
    handler: K;
    hookHandler: OpenSeadragon.EventHandler<MouseTrackerEventMap[K]>;
  };
}[MouseTrackerHandlerName];

export interface ViewerInputHookOptions {
  viewer?: OpenSeadragon.Viewer;
  hooks?: OptionsHook[];
}

/**
 * Creates a new ViewerInputHook attached to the viewer.
 *
 * @method addViewerInputHook
 * @memberof external:"OpenSeadragon.Viewer"#
 * @param {Object} options
 * @param {Object[]} [options.hooks]
 * @returns {ViewerInputHook}
 *
 **/
OpenSeadragon.Viewer.prototype.addViewerInputHook = function (
  options?: ViewerInputHookOptions,
): ViewerInputHook {
  options = options || {};

  options.viewer = this;
  return new ViewerInputHook(options);
};

/**
 * @class ViewerInputHook
 * @classdesc Provides hooks into the OpenSeadragon viewer event pipeline.
 * @param {Object} options
 * @param {external:"OpenSeadragon.Viewer"} [options.viewer] - Reference to OpenSeadragon viewer to attach to.
 * @param {Object[]} options.hooks
 */
export default class ViewerInputHook {
  /**
   * ViewerInputHook version.
   * @member {Object} OpenSeadragonImaging.ViewerInputHook.version
   * @static
   * @property {String} versionStr - The version number as a string ('major.minor.revision').
   * @property {Number} major - The major version number.
   * @property {Number} minor - The minor version number.
   * @property {Number} revision - The revision number.
   */
  static version = __PKG_VERSION_OBJ__;

  viewer: OpenSeadragon.Viewer | null;
  viewerTrackers: ViewerTrackers;
  hooks: Hook[];

  constructor(options?: ViewerInputHookOptions) {
    if (!OpenSeadragon.version || OpenSeadragon.version.major < 3) {
      throw new Error(
        'OpenSeadragonImaging ViewerInputHook requires OpenSeadragon version 3.0.0+',
      );
    }

    options = options || {};
    options.hooks = options.hooks || [];

    this.viewer = options.viewer || null;
    this.viewerTrackers = {} as ViewerTrackers;
    this.hooks = [];

    if (this.viewer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const viewerAny = this.viewer as any;
      this.viewerTrackers.viewer = viewerAny.innerTracker || null;
      this.viewerTrackers.viewer_outer = viewerAny.outerTracker || null;
    }

    for (const optionsHook of options.hooks) {
      let curTracker: OpenSeadragon.MouseTracker | null;

      if (typeof optionsHook.tracker === 'string') {
        const trackerName = optionsHook.tracker as ViewerTrackerName;
        if (!this.viewer) {
          throw new Error('A viewer must be specified.');
        }
        curTracker = this.viewerTrackers[trackerName];
        if (curTracker === undefined) {
          throw new Error('Unknown tracker specified: ' + optionsHook.tracker);
        }
      } else {
        curTracker = optionsHook.tracker as OpenSeadragon.MouseTracker;
      }

      const handlerName: MouseTrackerHandlerName = optionsHook.handler;

      if (curTracker) {
        this.hooks.push({
          tracker: curTracker,
          handlerName: handlerName,
          origHandler: curTracker[
            handlerName
          ] as MouseTrackerEventHandler | null,
          hookHandler: optionsHook.hookHandler,
        });

        (function (_this, tracker, handler, hookHandler) {
          const origHandler = tracker[handler] as MouseTrackerEventHandler;
          tracker[handler] = function (event: MouseTrackerEvent) {
            return _this._callHandlers(hookHandler, origHandler, event);
          };
        })(this, curTracker, handlerName, optionsHook.hookHandler);
      }
    }
  }

  private _callHandlers(
    hookHandler: MouseTrackerEventHandler,
    origHandler: MouseTrackerEventHandler | null,
    event: MouseTrackerEvent,
  ): void {
    hookHandler(
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
      event as MouseTrackerEventHandler extends (e: infer E) => any ? E : never,
    );
    if (origHandler && !event.stopHandlers) {
      origHandler(
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
        event as MouseTrackerEventHandler extends (e: infer E) => any
          ? E
          : never,
      );
    }
    if (event.stopBubbling && event.originalEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalEvent = event.originalEvent as any;
      if (typeof originalEvent.stopPropagation === 'function') {
        originalEvent.stopPropagation();
      }
    }
  }

  destroy(): void {
    while (this.hooks.length > 0) {
      const curHook = this.hooks.pop();
      if (curHook) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (curHook.tracker[curHook.handlerName] as any) = curHook.origHandler;
      }
    }

    if (this.viewer) {
      this.viewerTrackers = {} as ViewerTrackers;
      this.viewer = null;
    }
  }
}

// export default (function (OSD, $) {
// 	$.ViewerInputHook = function (options) {
// 		var curHook, curTracker;

// 		options = options || {};
// 		options.hooks = options.hooks || [];

// 		this.viewer = options.viewer || null;
// 		this.viewerTrackers = {};
// 		this.hooks = [];

// 		if (this.viewer) {
// 			this.viewerTrackers.viewer = this.viewer.innerTracker;
// 			this.viewerTrackers.viewer_outer = this.viewer.outerTracker;
// 		}

// 		for (curHook = 0; curHook < options.hooks.length; curHook++) {
// 			if (typeof options.hooks[curHook].tracker === 'string') {
// 				if (!this.viewer) {
// 					throw new Error('A viewer must be specified.');
// 				}
// 				curTracker = this.viewerTrackers[
// 					options.hooks[curHook].tracker
// 				];
// 				if (curTracker === undefined) {
// 					throw new Error(
// 						'Unknown tracker specified: ' +
// 							options.hooks[curHook].tracker
// 					);
// 				}
// 			} else {
// 				curTracker = options.hooks[curHook].tracker;
// 			}

// 			this.hooks.push({
// 				tracker: curTracker,
// 				handlerName: options.hooks[curHook].handler,
// 				origHandler: curTracker[options.hooks[curHook].handler],
// 				hookHandler: options.hooks[curHook].hookHandler
// 			});

// 			(function (_this, tracker, handler, hookHandler) {
// 				var origHandler = tracker[handler];
// 				tracker[handler] = function (event) {
// 					return _this._callHandlers(hookHandler, origHandler, event);
// 				};
// 			})(
// 				this,
// 				curTracker,
// 				options.hooks[curHook].handler,
// 				options.hooks[curHook].hookHandler
// 			);
// 		}
// 	};

// 	/**
// 	 * ViewerInputHook version.
// 	 * @member {Object} OpenSeadragonImaging.ViewerInputHook.version
// 	 * @static
// 	 * @property {String} versionStr - The version number as a string ('major.minor.revision').
// 	 * @property {Number} major - The major version number.
// 	 * @property {Number} minor - The minor version number.
// 	 * @property {Number} revision - The revision number.
// 	 */
// 	$.ViewerInputHook.version = '<%= pkg.version.obj %>';

// 	$.ViewerInputHook.prototype._callHandlers = function (
// 		hookHandler,
// 		origHandler,
// 		event
// 	) {
// 		var ret = hookHandler(event);
// 		if (origHandler && !event.stopHandlers) {
// 			ret = origHandler(event);
// 		}
// 		return event.stopBubbling ? false : ret;
// 	};

// 	/**
// 	 * Remove hooks and OpenSeadragon references. Call before
// 	 * OpenSeadragon.Viewer.destroy().
// 	 * @function OpenSeadragonImaging.ViewerInputHook.prototype#destroy
// 	 * @since 2.2.0
// 	 */
// 	$.ViewerInputHook.prototype.destroy = function () {
// 		while (this.hooks.length > 0) {
// 			let curHook = this.hooks.pop();
// 			curHook.tracker[curHook.handlerName] = curHook.origHandler;
// 		}

// 		if (this.viewer) {
// 			delete this.viewerTrackers.viewer;
// 			delete this.viewerTrackers.viewer_outer;
// 			this.viewer = null;
// 		}
// 	};

// 	return $.ViewerInputHook;
// })(
// 	OpenSeadragon || window.OpenSeadragon,
// 	(window.OpenSeadragonImaging = window.OpenSeadragonImaging || {})
// );
