# Beam 基础概念
这篇文档介绍 Beam 中各种概念背后的基本理念，以及它们是如何与下层的 WebGL 相关联的。


## 从 WebGL 到 Beam
虽然 WebGL 以 API 繁冗而著称，但对于熟练的使用者而言不难发现，在使用它时所需掌握的核心概念并不多。以形如 `gl.createXXX` 的 API 为例，典型的 WebGL 应用主要只涉及创建并管理这些类型的资源：

* **Shader** - 通过 `createShader` / `createProgram` 创建
* **Buffer** - 通过 `createBuffer` 创建
* **Texture** - 通过 `createTexture` 创建
* **FBO** - 通过 `createFramebuffer` / `createRenderbuffer` 创建

这四个概念中，前三个是最为核心的。剩下的 FBO 其实只是用于将原本渲染到屏幕的输出改为渲染到 Texture，对其他概念并没有太多影响。因此我们可以说，要想封装 WebGL，处理好 **Shader/Buffer/Texture** 就足够了。

概括地说，我们最关心的这三个核心概念，在图形渲染管线中分别承担这些职责：

* **Buffer**（缓冲区）负责存放与顶点相关的数据。假设我们有 1000 个顶点，而渲染每个顶点时都需要空间坐标、纹理坐标、法向量三份数据。那么，我们可以声明三个 Buffer，每个 Buffer 分别存放 1000 份空间坐标、1000 份纹理坐标和 1000 份法向量。这样，顶点着色器就能通过不同的 Attribute 变量，来使用这几个 Buffer 中的数据了。例如，我们可以在顶点着色器中定义形如 `pos` / `texCoord` / `normal` 的三个 Attribute 变量。这样，这个着色器每次运行，就会从分别关联到这三个 Attribute 的三个不同 Buffer 中取出相应长度（如 `normal` 是 `vec3`，`texCoord` 是 `vec2`）的数据来做一次计算。每次绘制，将并行地执行这一顶点着色器 1000 次。
* **Texture**（纹理）负责存放可以根据「坐标」读取的二维数据，最常见的应用是各类贴图。每个 `<img>` / `<canvas>` 等 DOM 中能够作为纹理的资源，都对应于一个 Texture 对象。绘制时我们需要手动指定使用哪些纹理。例如对于两个顶点结构一致（都需要空间坐标、纹理坐标、法向量等）但贴图不同的盒子，就需要切换纹理资源后，使用同一个着色器分两次绘制。
* **Shader**（着色器）分为顶点着色器与片元着色器，它们负责通过具体的着色算法来绘制图像。着色器绘制时需要用到的数据，除了 Buffer 内的各类顶点数据和 Texture 纹理数据之外，还有类似「全局变量」的 Uniform 数据。Uniform 一般用于传入少量参数，来指定绘制时的观察矩阵、光照强度等配置。特别地，着色器使用哪几个纹理单元来采样图像，也是通过 Uniform 变量来配置的。着色器均需要在初始化阶段动态编译，并且一个完整的图形渲染管线通常需要多个不同的着色器分别负责绘制天空盒、模型、后处理等内容，来渲染出完整的场景。

多数的通用渲染引擎选择将这些概念尽量屏蔽。例如 Three 的两个核心抽象：

* **Geometry** - 所谓的几何数据，实际上等同于 Buffer 中的顶点数据。这里的空间坐标、法向量、纹理坐标等内容，都是完全一一对应的。
* **Material** - 所谓的材质数据，实际上等同于一组 Texture 数据，加上一些 Uniform 参数配置。值得一提的是，引擎可以根据 Material 参数来做一些优化，例如 1000 个盒子如果只使用了两种不同的材质，就可以只用 2 个 Draw Call 来完成绘制。

那么 Shader 呢？理论上，只要配置 Geometry 和 Material 时传入足够的附加信息，着色器就可以完全基于这些配置来动态生成。Three 设计了复杂的架构来做到这一点，这应当也是它难以被 Tree Shaking 优化的主要原因之一。

在理解了 WebGL 概念与主流渲染引擎的抽象之间的关系后，再来回顾 Beam 的设计就更加有趣了。和 Three 选择完全封装掉 Shader 不同，Beam 将可配置的 Shader 作为自己的核心，这带来了这样的概念抽象：

* `ShadePlugin` 着色插件由使用者指定，只要包含一个或多个着色插件的数组，就能构成一条完整的渲染路径。
* `Element` 元素包含了语义化的 Buffer 与 Texture 数据。例如一个 `CubeElement` 就可以指定自己的 `position` / `size` / `image` 等信息，由插件来将这些语义化的数据转换为对 WebGL 友好的数组、图像数据。这些「已经准备好提交到 GPU」的数据，我们定义为 `Prop`。不同 Prop 在上传到 GPU 时有不同的方式，这是通过着色插件内对 Prop 约定的一套 Schema 来指定的。
* `Globals` 全局对象是一个容器，可以包含各类语义化的数据，由插件指定如何将其转换为 Uniform。例如一个全局的 `camera` 字段，就可以被插件转换并传入着色器中的 `viewMatrix` 变量。

作为总结，从与 WebGL 的关系来看，Beam 的核心抽象是这样的：

* `ShadePlugin` 是对 Shader 可插拔、规范化的封装。
* `Element` 是对 Buffer 和 Texture 的封装。
* `Globals` 是对 Uniform 的封装。

Globals 相对容易理解，下面我们主要介绍 ShadePlugin 与 Element 的相关概念。


## ShadePlugin 概念
Beam 的着色插件和典型的 WebGL 着色器或 WebGL 应用之间，有什么区别和联系呢？可以理解为，Beam 着色插件的能力介于原生着色器和应用之间：

* 原生的 WebGL 着色器一般只包含一对顶点着色器和片元着色器，再加上它们内部 Uniform 和 Attribute 的位置参数信息。而 Beam 着色插件不仅包含着色器的 GLSL 源码和指定 GLSL 变量位置的 ShaderSchema，还包含指定如何生成向 GPU 提交的 Props 数据的 `propsByElement` 和 `propsByGlobals`，以及用于配置 Props 的 PropSchema。
* 原生的 WebGL 应用需要大量管理 GL 状态的代码。着色插件只需要提供了 Schema，就可以让引擎管理这些状态，无需手动管理。

可以认为，Beam 就是为着色插件管理资源的运行时。通过简单地切换、定制着色插件，我们就可以用非常轻量的代码库来渲染出不再限于 3D 或 2D 的效果了。


## Element 概念
在示例中，Beam 中的 Element 概念看起来很简单：只要 `addElement` 然后 `render`，就可以渲染出场景了。但其实，这个概念是重度在 WebGL 的 Buffer 和 Texture 的基础上封装的，因此存在着一些值得注意的特殊之处。

一组 Element 会直接对应到显存中的一段 Buffer 数据，并且我们也会在每次 `addElement` 时更新这段 Buffer 数据。由于 WebGL 中的 Buffer 是定长的缓冲区，而不是 JS 那样的可变数组，因此有这些特点和限制：

* 默认情况下，Element 数组中的顺序与最终元素的层级顺序是无关的。WebGL 的深度测试会自动将 Element 绘制为正确的深度顺序。当然，你也可以手动禁用深度测试，从而基于 Element 数组的顺序来绘制出特殊的效果。
* Element 中的各类顶点数量必须固定而不能动态浮动，否则是无法在连续的显存空间中布局的。实际上对于 3D 场景而言，一个 Element 一般对应于一个顶点数量固定的 3D 模型。这时常见的操作是矩阵变换，而不是改变模型的顶点数量。
* Element 在每次 `add` / `change` 时都会通过 `gl.bufferSubData` 更新显存，因此连续执行大量 `addElement` 是**非常高耗**的，可以使用形如 `addElements` 的方式批量插入来优化。
* 由于相同的原因，Element 的连续 `remove` 操作是同样高耗的。对于批量移除元素的场景，也建议始终使用 `removeElements` 的 API 来实现。

Element 中还可以携带 Image 元素来作为 Texture。例如，形状相同但贴图不同的两个盒子，就相当于 `image` 字段不同而其他字段相同的两个 Element。如果多个 Element 包含了相同的 Image，那么这些 Image 最终都会被合并为同一个 Texture 对象。在绘制时，引擎会根据不同 Element 中这些对象的异同，来自动分组绘制 Element。
