# OpenSeadragonViewerInputHook

OpenSeadragonViewerInputHook is a plugin for [OpenSeadragon](https://github.com/openseadragon/openseadragon) 3.0.0+
which provides hooks into the user input event pipeline for providing additional behavior and/or
overriding the default behavior.

- [Demo/Test Site](https://openseadragon-imaging.github.io/#/imaginghelper)

## Usage

> [!NOTE]
> _OpenSeadragonViewerInputHook requires [OpenSeadragon](https://github.com/openseadragon/openseadragon) version 3.0.0+._

The OpenSeadragonViewerInputHook library is bundled in ES and UMD module format separately, and can be obtained the following ways:

**Direct Download**

- [openseadragon-viewerinputhook.d.ts](https://openseadragon-imaging.github.io/builds/openseadragon-viewerinputhook.d.ts)
- [openseadragon-viewerinputhook.js](https://openseadragon-imaging.github.io/builds/openseadragon-viewerinputhook.js)
- [openseadragon-viewerinputhook.js.map](https://openseadragon-imaging.github.io/builds/openseadragon-viewerinputhook.js.map)
- [openseadragon-viewerinputhook.umd.js](https://openseadragon-imaging.github.io/builds/openseadragon-viewerinputhook.umd.js)
- [openseadragon-viewerinputhook.umd.js.map](https://openseadragon-imaging.github.io/builds/openseadragon-viewerinputhook.umd.js.map)

**npm**

```sh
npm install @openseadragon-imaging/openseadragon-viewerinputhook
```

The OpenSeadragonViewerInputHook module can be included using a script tag in HTML (UMD module) or imported as an ES module.

A **ViewerInputHook** object can be created and attached (if desired) to an [OpenSeadragon.Viewer](https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html) two ways:

1. Call the addViewerInputHook method on the viewer
2. Create a new ViewerInputHook object, passing a viewer reference in the options parameter (optional)

Both methods return a new ViewerInputHook object, and both methods take an options parameter where the event handlers to be hooked may be specified (see the 'Details' section below).

**Example using UMD module in an HTML script tag**

```html
<!-- Load OpenSeadragon dependency first! -->
<script
  defer
  src="/[path_to]/openseadragon.min.js"
></script>
<script
  defer
  src="/[path_to]/openseadragon-viewerinputhook.umd.js"
></script>
<script
  defer
  src="/[path_to]/script.js"
></script>
```

```javascript
// script.js Example 1 - Use the Viewer.addViewerInputHook() method to create a ViewerInputHook

// create an OpenSeadragon viewer
const viewer = window.OpenSeadragon({...});
// add a ViewerInputHook to the viewer
const viewerInputHook = viewer.addViewerInputHook({ hooks: [...] });
```

```javascript
// script.js Example 2 - Attach a new ViewerInputHook to an existing OpenSeadragon.Viewer

const viewerInputHook = new window.OpenSeadragonImaging.ViewerInputHook({ viewer: existingviewer, hooks: [...] });
```

**Example using ES module**

```sh
npm install openseadragon
npm install @openseadragon-imaging/openseadragon-viewerinputhook
```

```ts
// Example 1 - Use the Viewer.addViewerInputHook() method to create a ViewerInputHook

import OpenSeadragon from 'openseadragon';
import '@openseadragon-imaging/openseadragon-viewerinputhook';

// create an OpenSeadragon viewer
const viewer = OpenSeadragon({...});
// add a ViewerInputHook to the viewer
vconstr viewerInputHook = viewer.addViewerInputHook({
  hooks: [...]
});
```

```ts
// Example 2 - Attach a new ViewerInputHook to an existing OpenSeadragon.Viewer

import OpenSeadragon from 'openseadragon';
import OpenSeadragonViewerInputHook from '@openseadragon-imaging/openseadragon-viewerinputhook';

const viewerInputHook = new OpenSeadragonViewerInputHook({
  viewer: existingviewer,
  hooks: [...]
});
```

## Details

Event handler callbacks are specified in the hooks property (array) of the options object passed when creating a ViewerInputHook object (see example code below).
Any number of hooks can be specified.

Each hook specification in the array should have three properties - tracker, handler, and hookHandler.

The tracker property of each hook definition can be a reference to any [OpenSeadragon.MouseTracker](https://openseadragon.github.io/docs/OpenSeadragon.MouseTracker.html) instance,
or one of the pre-defined OpenSeadragon viewer trackers - currently 'viewer' or 'viewer_outer'.

The handler property of each hook definition specifies which MouseTracker handler to hook.
Valid values are:

- `'preProcessEventHandler'`
- `'enterHandler'`
- `'exitHandler'` (deprecated)
- `'leaveHandler'`
- `'overHandler'`
- `'outHandler'`
- `'moveHandler'`
- `'pressHandler'`
- `'releaseHandler'`
- `'nonPrimaryPressHandler'`
- `'nonPrimaryReleaseHandler'`
- `'clickHandler'`
- `'dblClickHandler'`
- `'contextMenuHandler'`
- `'scrollHandler'`
- `'keyDownHandler'`
- `'keyUpHandler'`
- `'keyHandler'`
- `'focusHandler'`
- `'blurHandler'`
- `'dragHandler'`
- `'dragEndHandler'`
- `'pinchHandler'`
- `'stopHandler'`

The hookHandler property of each hook definition should be the user-defined event handler callback. All event handler callbacks have the following signature:

```ts
// TypeScript type declarations in openseadragon-viewerinputhook.d.ts

OpenSeadragon.EventHandler<T> = (event: T) => void
```

The ViewerInputHook class inserts your event hook handler methods in front of any existing event handler methods
so the attached handler will be called first. Additional ViewerInputHook objects can be added on the same viewer/MouseTracker to create a chain of hook methods,
where the last added handler(s) will be called first.

> [!NOTE]
> _If multiple ViewerInputHook are attached to the same viewer/MouseTracker, destroy() should be called for each ViewerInputHook in reverse order of attachment!_

Your hook event handler methods can control the event handling behavior in one or more of the following ways:

1. Set event.stopHandlers = true to prevent any more handlers in the event handler chain from being called
2. Set event.stopBubbling = true to prevent the original DOM event from bubbling up the DOM tree
3. Set event.preventDefault = true to prevent the viewer's default action in response to the event (currently applies to preProcessEventHandler, keyDownHandler, keyUpHandler, keyHandler, contextMenuHandler, and scrollHandler on the viewer (tracker = 'viewer'))

```javascript
// Example

var viewer = OpenSeadragon({...});

const viewerInputHook = viewer.addViewerInputHook({
  hooks: [
    {
      tracker: 'viewer',
      handler: 'contextMenuHandler',
      hookHandler: (event) => {
        // Disable context menu on the viewer using ContextMenuMouseTrackerEvent.preventDefault
        event.preventDefault = true;
      },
    },
    {
      tracker: 'viewer',
      handler: 'scrollHandler',
      hookHandler: (event) => {
        // Disable mousewheel zoom on the viewer and let the original mousewheel events bubble
        if (!event.isTouchEvent) {
          event.stopHandlers = true;
        }
      },
    },
    {
      tracker: 'viewer',
      handler: 'clickHandler',
      hookHandler: (event) => {
        // Disable click zoom on the viewer
        event.stopHandlers = true;
      },
    },
  ],
});
```

## TODO

- jsdoc documentation
- Provide hooks on reference strip events
- Provide hooks on navigator events
