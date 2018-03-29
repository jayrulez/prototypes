# Node 调用原生模块

* [文档](https://nodejs.org/api/addons.html)
* [示例](https://github.com/nodejs/node-addon-examples)
* [node-gyp](https://github.com/nodejs/node-gyp)

流程：

1. C++ 中引入 node 头文件，使用 V8 相关 API 编码。
2. 使用 `node-gyp` 将 C++ 源码编译为 `addon.node` 文件。
3. 在 JS 中正常 `require` 调用。

> 使用实验性的 N-API 可以隔离 V8 的 API 变更。

