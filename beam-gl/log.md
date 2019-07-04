# DevLog 1907
* DONE regl 概念参考 - 引入 Resource / Context
* DONE ResourceSchema 概念引入
* DONE usePlugin 基本支持
* DONE resourceId 基本设计
* TODO Resource

## 设计目标
* 动态切换 / 编译 Shader
* 多个 Shader 共享 Buffer
* 符合直觉的 FBO 管理
* 多个 Renderer 的作用域管理
* Plugin 运行时动态增删

## 已知问题
* CPU View Frustrm Culling 较麻烦，与自动合并 Draw Call 特性冲突
