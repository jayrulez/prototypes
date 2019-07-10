# DevLog 1907
* DONE regl 概念参考 - 引入 Resource / Context
* DONE ResourceSchema 概念引入
* DONE usePlugin 基本支持
* DONE resourceId 基本设计
* DONE Shape Utils 增加 Cache
* DONE Schema from 基本支持
* DONE Basic Shape 插件线框改造
* DONE resources 概念支持
* DONE 插件 resource 相关状态迁移
* DONE ResourceContainer 概念引入
* DONE Resource Buffer 共享状态冲突解决
* DONE Resource Buffer 数据结构设计
* DONE Basic Shapes 系列示例适配
* TODO Resource

## 设计目标
* 动态切换 / 编译 Shader
* 多个 Shader 共享 Buffer
* 符合直觉的 FBO 管理
* 多个 Renderer 的作用域管理
* Plugin 运行时动态增删

## 已知问题
* CPU View Frustrm Culling 较麻烦，与自动合并 Draw Call 特性冲突
* Uniform 暂无法在运行阶段增量式更新
* 同时绘制三角 + 线框的场景，仍然需要开辟两份 Buffer - 如何优化？
* 若元素 State 相同，在不同插件之间是否可能存在不同 Draw Group？- 应当不允许
* 初步 Resource 复用 Demo 采用插件动态切换形式实现
* 如何处理描边数据？需在两个插件之间共享 Buffer，并影响 createElement

``` js
const wireframePlugin = new WireframePlugin()
const meshPlugin = new MeshPlugin()
// meshPlugin.resourceId = wireframePlugin.resourceId
// sharePluginState(plugins, shareIndex)
Beam.sharePluginState([wireframePlugin, meshPlugin], false)

renderer.usePlugin(wireframePlugin, meshPlugin)

wireframePlugin.resourceSchema = {
  buffers: {
    pos: { type: vec4, n: 3, from: 'positions' },
    color: { type: vec4, from: (state) => state.colors },
    index: { type: index }
  }
}

// NO plugin.resourcesByElement
const createBallElement = () => (
  createElement(BALL_STATE, [wireframePlugin, meshPlugin])
)

const ball = createBallElement()

renderer.addElement(ball)
renderer.render()
```

``` js
renderer.addElement(...elements)
renderer.removeElement(...elements)
```
