# RailMan

## Project Summary

RailMan is a web-based interactive railcar yard visualization tool. It displays a yard map, placeholder spots, and draggable railcars with product and status indicators.

### Implemented Features

- All CSS styling is in a dedicated `style.css` file.
- All JavaScript logic is in a dedicated `railmap.js` file.
- HTML (`railmap.html`) loads CSS via `<link rel="stylesheet" href="style.css">` and JavaScript via `<script src="railmap.js"></script>`.
- Interactive drag-and-drop of railcars between placeholder spots.
- Animated "snap-back" for invalid placements.
- Mouse hover highlights individual railcars.
- Zoom and pan support for large yard maps.
- All rendering is canvas-based for smooth performance.
- Railcar status color and labeling.
- Responsive to browser window resizing.

To get started, open `railmap.html` in your browser (alongside `style.css`, `railmap.js`, and your yard map image).
