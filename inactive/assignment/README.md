# Ripple Assignment
> Just start a static file server to run the code snippet.

The current code doesn't depends on React, but only works for basic mousedown events. Sorry for not having enough time, and I've been away from React components for a while.

But the idea is simple: **On every input (touch/mouse) event, recalculate all future ripple size states**. The `requestAnimationFrame` loop picks one ripple state per frame. If no ripple state is in the `sizes` array, nothing happens. A state machine can also be introduced to handle the complexity.

I've done some similar related projects, hope their code make some sense.

* For customizing React rendering backend and native components, see my [React SSD1306](https://github.com/doodlewind/react-ssd1306) demo.
* For RxJS-based event stream, see my [Rx Elevator](https://github.com/doodlewind/rx-elevator-demo) demo, which shares similar "recalculate all future events" concepts to this assignment.
* For touch events support, see [Freecube's Gesture handler](https://github.com/doodlewind/freecube/blob/master/demo/app.js) demo that rotates Rubik's Cube in Web.
