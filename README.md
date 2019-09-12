# mapinput-delta

This is a simple jQuery plugin for providing a visual, map based interface to latitude, longitude and delta fields. These 3 fields are used in some applications to describe bounding boxes around geographic areas. The lat/lng are the center of the box, delta is the number of degrees to the edge of the box.

## Usage

`$("input.mapinput").mapinput();`

This will bind a handler to the `focus` event of the input selected. When given focus, a modal will open with a google map. The map contains a drawing manager which can be used to draw a rectangle on the map. Upon completion of the drawing event, the rectangle will snap to dimensions. The dimensions are derived from the giving the rectangle the same number of degrees from the center to the longitude edge to it's latitude edge. In other words, the rectangle will be shrunk or enlarged vertically to scale to it's width.

At the equator, the rectangle would be a square. Anywhere north or south of the equator it will be elongated vertically.

When the modal is closed (ie: editing of the rectangle is complete), the input closest inputs named `latitude`, `longitude` and `delta` are updated with the values present on the rectangle that was drawn

## Still To Do
- If lat/lng/delta are set, they should be used to place a rectangle on the map, adjustment of which will update the fields.

## Dependencies
- [jQuery](https://code.jquery.com/)
- [Google Maps API v3](https://developers.google.com/maps/)


