# Layer Picker
A canvas-based hit detection lib.

![demo](./demo/demo.png)


## Introduction
When you have multi "elements" with different shapes, it's non-trivial to pick an element by coordinate. This lib makes use of HTML5 canvas for general-purposed hit detection. Core features:

* Multi layer type support, including `rect`, `image` and `svg`.
* Layer transform matrix support.
* Reliable promise-based async update.
* Tiny (~1KB min+gzipped) & fast.


## Usage
Install via NPM:

``` bash
npm i layer-picker
```

Import & use:

``` js
import { LayerPicker } from 'layer-picker'

// Init picker instance.
const picker = new LayerPicker()

// Provide layer info.
const layers = [
  { type: 'rect', name: 'a', x: 10, y: 10, width: 100, height: 100 },
  { type: 'rect', name: 'b', x: 50, y: 50, width: 100, height: 100 }
]

// Build hit test bitmap with size.
picker.update(layers, 400, 300).then(() => {
  // Enjoy fast hit test.
  picker.pick(0, 0) // null
  picker.pick(20, 20).name // 'a'
  picker.pick(100, 100).name // 'b'
})
```

Each `Layer` supports following props:

* `type` - Layer type. `rect` for basic rect, `image` for image element, `svg` for vector.
* `x` - X coordinate in pixels.
* `y` - Y coordinate in pixels.
* `width` - Layer width in pixels.
* `height` - Layer height in pixels.
* `$el` - DOM element for `image` or `svg` (For `image` layer, this element is expected to be loaded before calling `update`).
* `transform` - 2D transform matrix object, including `a`, `b`, `c`, `d`, `tx`, `ty` as its props. This field is optional.

> No more methods! Just take away `update` / `pick` and that's all.
