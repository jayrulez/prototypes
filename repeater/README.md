# Repeater
📼 Record browser events as visual test case.


## Introduction
There're several pain points testing large web apps:

* It's *hard* to write test cases for complex user operations.
* It's *hard* to add test support for existing projects.
* It's *hard* to ensure the final UI renders correctly.

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

Repeater is mainly composed of two parts: **Recorder** to collect user events, and **Replayer** for runing tests.

### Record Events
To record events in existing project, include the script *before* any other modules:  

``` js
import 'repeater.js'
import 'vue'
// ...
```

Then after test page loaded, user events will be automatically recorded. To save a event log, open Chrome console and type `copyLog()`, paste it anywhere you like.

> Chrome extension WIP.

### Replay Tests
Once event log saved, you can add screenshot with Repeater CLI:

``` bash
npx repeater path/to/log.json --update
```

This will take screenshot for you. To verify the test case, run:

``` bash
npx repeater path/to/log.json
```

Or batching tests:

``` bash
npx repeater path/to/tests
```


## API
> CLI options WIP.


## Roadmap
* TODO record UI
* TODO test coverage
* TODO ENV and CI config


## Caveats

### Wheel Events
Chrome 51 no longer scrolls when the user-defined wheel event is dispatched. Per the DOM spec (3.10) events are not action-causers, but notifications of an action already-in-process. Chrome was aware of this defect and has not finally fixed it.


## License
MIT
