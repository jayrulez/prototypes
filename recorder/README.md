# Recorder PoC

* TODO add keyboard events demo
* TODO replay keyboard events
* TODO event minifiy
* TODO record UI
* TOOD CLI interface specifing log file
* TODO auto screenshot
* TODO image / log file management (lifecycle design)
* TODO image comparison
* TODO test coverage


## Scroll and Wheel Events
Chrome 51 no longer scrolls when the user-defined wheel event is dispatched. Per the DOM spec (3.10) events are not action-causers, but notifications of an action already-in-process. Chrome was aware of this defect and has not finally fixed it.