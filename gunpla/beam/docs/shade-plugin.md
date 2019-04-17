# Beam 着色插件开发
> 原型迭代阶段，若干 API 可能变更，以实际源码为准。


## 基本概念
Beam 全部的实际渲染能力都是建立在着色插件的基础上的。一个渲染器实例可以支持任意顺序的一组着色插件，从而组合出开放的渲染路径。每个着色插件都像是基于 WebGL 工具库实现的一个独立着色器应用，只不过其所需的 Buffer/Uniform 等资源交由引擎自动管理。在完整的 Beam 应用中，引擎与着色插件的协作流程大致如下:

1. 初始化阶段，引擎编译着色器，根据插件的 `shaderSchema` 来获得各个着色器变量的 location 信息。
1. 上层调用 `addElement` API，添加包含语义化数据的 Element 元素。
2. 引擎将 Element 中的语义化数据，根据着色插件提供的逻辑，转换为 JS 内「准备好提交到 GPU」的数据。我们将这类数据称作 Props。例如一个带着 `color` 字段的 Element，在这一阶段就可以将 `'red'` 转换为形如 `[1, 0, 0, 1]` 的 Props。Props 既可以来自于 Element，也可以来自于 Globals。
3. 引擎根据着色插件的 `propSchema` 配置与初始化时获得的 location 信息，将「准备好」的 Props 数据上传到 GPU。
4. 引擎 `render` 时结合来自 Element 与 Globals 的 Props 数据，调度 Draw Call 绘制出元素。

理解了上述流程后，就不难复用对 WebGL 的知识来定制着色插件了。


## 着色插件结构
着色插件均继承自 `ShadePlugin` 基类，包含这些内容：

* 一组顶点着色器 + 片元着色器的 GLSL 代码
* 指定着色器变量类型的 `shaderSchema`
* 指定 Props 数据到着色器映射关系的 `propSchema`
* 指定如何从 Element 获得 Props 的 `propsByElement`
* 指定如何从 Globals 获得 Props 的 `propsByGlobals`
* 若干能在特定渲染阶段控制 GL 对象的回调，如 `beforeDraw` 等

可以通过参考 examples 中的实例，来理解着色插件的这些配置是如何确定的。


## Schema 约定
Beam 使用一套简单的命名约定和类型标识来自动维护运行时的数据映射关系，这对应于名为 shaderSchema 与 PropSchema 的两套结构。例如基础的 Cube 着色插件，其使用的 Schema 配置是形如这样的：

``` js
// ...inside plugin constructor
const { vec3, vec4, mat4 } = ShaderTypes
this.shaderSchema.attributes = {
  pos: vec3,
  color: vec4
}
this.shaderSchema.uniforms = {
  viewMat: mat4,
  projectionMat: mat4
}

const { attribute } = PropTypes
this.propSchema = {
  pos: { type: attribute, n: 3 },
  color: { type: attribute, n: 4 },
  index: { type: attribute, index: true }
}
```

这里的 `ShaderTypes` 和 `PropTypes` 是引擎提供的类型常量。通过这一配置，`propSchema` 中的 `color` 字段告诉引擎，元素 Props 数据中的 `color` 字段装着 numCompoents 为 4 的 `attribute` 数组，由于这个字段名与 `shaderSchema.attributes` 下的 `color` 一致，因此在运行时引擎就能自动地将相应的 Props 数据提交到着色器中的 `attribute color` 变量所对应的 Buffer 了。

> Schema 中扩展的字段配置仍在演化中，暂时请以实际实现为准。
