# Recorder PoC

* TODO record UI
* TOOD CLI interface specifing log file
* TODO image / log file management (lifecycle design)
* TODO test coverage
* TODO ENV and CI config

``` bash
# Recorder doesn't need CLI by default.
# Take screenshot in extension.

repeater test my-log-path
```


## Scroll and Wheel Events
Chrome 51 no longer scrolls when the user-defined wheel event is dispatched. Per the DOM spec (3.10) events are not action-causers, but notifications of an action already-in-process. Chrome was aware of this defect and has not finally fixed it.
