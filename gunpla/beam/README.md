# Beam
着色插件驱动的 WebGL 渲染引擎


## 介绍
作为完全管理和掌控图形 API 的基础库，渲染引擎有着巨大的想象空间与定制可能性。但前端社区中目前主流的相关项目，通常要么是大而全的通用引擎，要么是极简的纯工具库。它们分别有各自的痛点问题：

* 通用引擎常常相当庞大，这导致了加载效率的低下和定制优化的困难。
* 工具库只能简化一些 WebGL 的胶水代码，你仍然必须手动管理复杂的 GL 状态和编写着色器。

在 Web 上，实际并没有太多的 3A 游戏级渲染需求，更多的是分散的轻量级应用场景。对于这些场景，不论是基于通用引擎还是工具库的开发显然都存在着各自的弊端。有没有能够两全其美的解决方案呢？

Beam 尝试用全新的理念，来支撑这些既强调图形渲染又追求规模可控的前端应用。Beam 通过维护一个极轻的核心库，并将自身的渲染能力拆分到标准化的**着色插件**中，做到了：

* 基于核心库来自动化地管理缓冲区、纹理等 WebGL 资源，并合并 Draw Call。这些优化几乎完全对上层透明。
* 基于可增删、可插拔的着色插件来定制渲染能力。你选择或定制什么样的着色插件，它就是什么样的渲染引擎。

这样，基于极轻的核心运行时加上可自由组合的着色插件，引擎就能方便地在兼顾易用性和体积的前提下，嵌入上层系统中使用了。

那么，什么是着色插件呢？在经典的前向渲染流程中，场景是需要通过一系列的着色器分多次绘制的。我们将这个渲染路径下的每个着色器抽取出来并规范化，就能得到可标准化的着色插件和可插拔的渲染路径了。

例如，如果需要渲染一个包含天空盒、阴影、物体网格和后处理的典型 3D 场景，那么可以为 Beam 提供形如这样的这些着色插件：

* Skybox 插件
* Shadow 插件
* Mesh 插件
* Post Processing 插件

而如果需要开发一个用于 2D 图像编辑的应用，则可以使用形如这样的这些插件：

* Image 插件
* Brush 插件
* Gradient 插件

Beam 希望通过极轻的核心加上 opt-in 的插件架构，实现对于更丰富多样的轻量渲染场景的支撑。除了基本的 Demo 外，更可以基于它开发出各类包含 UI 交互的框架层系统，最后再组合出实际应用。这就是 Beam 的基本理念——它不是强调统一和通用的引擎，更像是一套使每个人都能轻松定制出专有渲染引擎的开放工具包。


## 上手使用
Beam 是纯粹且不需要第三方依赖的前端基础库，建议通过源码目录下的 examples 来熟悉它。由于它采用 `<script type="module">` 的源码形式来优化开发体验，需要高版本 Chrome 并启动静态服务器来运行示例：

``` bash
cd beam
npm install -g http-server && http-server .
```

你也能很容易地新建自己的示例来体验它。例如，基于已有的 `CubePlugin`，一个基本的，用于绘制立方体的 Beam 应用形如这样：

``` html
<canvas id="gl-canvas" width="400" height="400"></canvas>
<script type="module">
import { Renderer, setCamera, setPerspective } from '../../src/index.js'
import { CubeElement, CubePlugin } from './cube.js'

const canvas = document.getElementById('gl-canvas')

const cubePlugin = new CubePlugin()
const renderer = new Renderer(canvas, [cubePlugin])
renderer.setGlobal('camera', setCamera([0, 10, 10]))
renderer.setGlobal('perspective', setPerspective(canvas))

const cubeA = new CubeElement({ position: [0, 0, 0] })
const cubeB = new CubeElement({ position: [3, 0, 0] })
renderer.addElement(cubeA)
renderer.addElement(cubeB)

renderer.render()
window.renderer = renderer
</script>
```


## 着色插件开发
对于 Beam 的插件定制，请参见 [Shade Plugin](./docs/shade-plugin.md) 文档。


## API
Beam 仍然在快速变化中，这里暂时只能列出粗略的 [API](./docs/api.md) 设计文档。
