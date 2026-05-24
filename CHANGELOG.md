## 3.0.0:

- Now using Vite for development and build processes
- Rewritten in TypeScript with full types for better DX
- Returning false in MouseTracker event handlers doesn't prevent bubbling - removed that feature
- Two distribution bundles, UMD module and ES module

## 2.2.1:

- Updated README and docs

## 2.2.0:

- Added destroy() method - frees OpenSeadragon references and restores hooks so OpenSeadragon not bound by the handler closures
