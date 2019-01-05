# Recorder PoC

* TODO record UI
* TOOD CLI interface specifing log file
* TODO auto screenshot
* TODO image / log file management (lifecycle design)
* TODO image comparison
* TODO test coverage
* TODO ENV and CI config

``` bash
# Recorder doesn't need CLI by default.
# Take screenshot in extension.

# Use log.json and snapshot.png by default.
worldline test my-log-path
```


## Scroll and Wheel Events
Chrome 51 no longer scrolls when the user-defined wheel event is dispatched. Per the DOM spec (3.10) events are not action-causers, but notifications of an action already-in-process. Chrome was aware of this defect and has not finally fixed it.
