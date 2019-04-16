# Beam API
> 原型迭代阶段，API 实现可能变更，这里只能给出较为宽泛的描述。


## Renderer
引擎对象实例

### Properties
* `config` - 默认 Buffer 尺寸等配置
* `globals` - 渲染时全局数据字段容器
* `elements` - 元素数组

### Methods
* `addElement` - 新增 Element
* `changeElement` - 修改 Element
* `removeElement` - 移除 Element
* `setGlobal` - 设置全局字段
* `render` - 渲染


## ShadePlugin
着色插件

### Properties
* `propSchema` - Props 字段到 Buffer/Uniform 的类型信息
  * `vertexShader` - 顶点着色器字符串
  * `fragmentShader` - 片元着色器字符串
  * `attributes` - Attribute 变量类型信息
  * `uniforms`- Uniform 变量类型信息
* `programSchema` - 着色器程序内变量的类型信息

### Methods
* `propsByElement` - 指定如何从生成 props
* `propsByGlobal` - 指定如何从 global 生成 props
* `beforeDraw` - 在一次 Draw Call 前改变 GL 状态


## Element
存放语义化数据的元素
