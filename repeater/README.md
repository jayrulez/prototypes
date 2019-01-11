# Repeater
📼 Record browser events as visual test case.


## Introduction
There're several pain points testing large web apps:

* It's *hard* to write test cases for complex user operations.
* It's *hard* to add test support for existing projects.
* It's *hard* to ensure the final UI renders corrently.

But, it's always trivial to "run test by yourself", what if we simply automate this process? Imagine this happy path:

1. Play around in your app, recording all user events (mouse/keyboard...) in the background.
2. Take screenshot image for final UI state.
3. Use headless browser to replay the events recorded, simply compare the screenshot as test result.

With this idea we invent Repeater, enabling a fresh way adding test cases. Core features:

* Provides snippet to record user events in browser automatically.
* Supports batch testing based on image diff, which can be accurate to pixels. 
* Works out of the box. We use your installed Chrome as host environment. No native dependency, no binary bundles.


## Usage
Install via NPM:

``` bash
npm install repeater.js
```

Run test with repeater CLI:

``` bash
npx repeater path/to/tests
```


## API
TODO


## Roadmap
* TODO record UI
* TODO test coverage
* TODO ENV and CI config


## Caveats

### Wheel Events
Chrome 51 no longer scrolls when the user-defined wheel event is dispatched. Per the DOM spec (3.10) events are not action-causers, but notifications of an action already-in-process. Chrome was aware of this defect and has not finally fixed it.


## License
MIT
