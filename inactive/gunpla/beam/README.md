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

这样，基于极轻的核心运行时加上可自由组合的着色插件，引擎就能在兼顾易用性和体积的前提下，无缝地嵌入上层系统中使用了。

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

你也能很容易地新建自己的示例来体验它。例如，基于已有的 `CubePlugin`，一个用于绘制立方体的简单 Beam 应用形如这样：

``` html
<canvas id="demo" width="400" height="400"></canvas>
<script type="module">
import { Basic3DRenderer } from '../common/custom-renderers.js'
import { CubePlugin, createCubeElement } from './cube.js'

const canvas = document.getElementById('gl-canvas')

const cubePlugin = new CubePlugin()
const renderer = new Basic3DRenderer(canvas, [cubePlugin])

const cubeA = createCubeElement({ position: [0, 0, 0] })
const cubeB = createCubeElement({ position: [3, 0, 0] })

renderer.setCamera([0, 10, 10])
renderer.addElement(cubeA)
renderer.addElement(cubeB)

renderer.render()
</script>
```

我们在这个示例中实例化出了一个 `renderer` 渲染器，并使用其 `addElement` 方法为其添加了若干个 `CubeElement` 元素实例。在 Beam 中，元素只是纯数据 State 的载体，不包含渲染状态与逻辑。而着色插件则会识别出其所支持的元素，将元素内形如 `position` 的语义化数据字段转换为 GPU 支持的缓冲区、纹理等数据，在最后 `render` 时渲染出全部元素。

在存在可用的着色插件时对 Beam 的基础使用，仅仅需要包括调用 `addElement` / `changeElement` / `removeElement` 这些操作元素的 API，再加上最终的 `render` 方法。这就是它的核心能力了。


## 概念
尽管 Beam 提供的 API 主要是面向 `Element` 的一些朴素操作，但这其实只是在 WebGL 基础上一层非常薄的抽象。如果你缺乏图形学相关的背景知识，而直接使用对待普通数据结构的方式来操作它们，那么很有可能被一些特殊的行为和限制所困扰。在深入使用 Beam 之前，建议阅读 [Concepts](./docs/concepts.md) 文档来理解 Beam 在概念上的抽象。


## 着色插件定制
Beam 在示例中配套提供了若干可直接使用的着色插件，但它的 opt-in 扩展式架构决定了我们很可能遇到这些插件尚不足以满足需求的情形。这时，你可以选择定制或从头实现出你的新着色插件。着色插件具备一套简便的 Schema 规范，能做到既在多数场景下无需直接操作 GL 状态，又能在需要的时候保留一定的控制力。

对于 Beam 的着色插件机制，请参见 [Shade Plugin](./docs/shade-plugin.md) 文档。


## API
Beam 仍然在快速演化中，这里暂时只能列出较为基础的 [API](./docs/api.md) 文档。
