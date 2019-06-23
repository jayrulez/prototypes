这个程序员单枪匹马，写出了用户百万的免费 PS

在 IT 产业的上古时代，流传着许多独行侠程序员们徒手写出操作系统、编程语言、浏览器等高难度软件的传说。随着行业的成熟，这些故事大多已经尘埃落定。但今天，我们有幸见证了一个正在进行中的年轻故事。这个故事的主人公，让世界上数以百万的人，用上了昂贵 Photoshop 软件的免费替代品。

家住捷克的伊万·库茨基尔 (Ivan Kutskir) 是个 90 后自由职业程序员。虽然伊万从来没有公司的正式工作，但这不是因为他太菜了，而是因为他太强了：他就读于捷克最好的布拉格查理大学。自学生时代起，他就靠着自己的编程天赋挣零花钱养活自己。他每个月只需要工作大约 20 小时， 就能赚够一个月 300 美元的生活费—这大致相当于在国内不加班月薪三万的水平。这样的自由生活给了他极大的空间做自己喜欢的事。在这期间，他写了许多试验性的个人项目，从 Flash 小游戏到 3D 模型渲染工具等等不一而足。这之中一个名叫 Photopea 的图片编辑器项目，改变了他的生活。
 
我们都知道，美国 Adobe 销售的 Photoshop，是图片编辑领域公认最为强大的软件之一。这个庞然大物功能固然强大，但 Adobe 的垄断地位使它对于普通用户并不友好：一份正版的 Photoshop CC 软件国内售价超过 3000 元，对电脑硬件配置有着很高的要求。并且 PSD 文件格式还是专有的，一般只能用 PS 打开编辑。于是，伊万在浏览器里折腾各种 3D 文件格式解析器之余，有了个大胆的想法：我们能在网页里打开 PSD 文件吗？

想法固然大胆，但稍有经验的程序员都可以看出，这个点子绝对比一开始就喊着「我要重新发明一个 Photoshop」要切实可行得多。伊万最早的规划是这样的：

* 先做一个简单的 PSD 格式解析器，这以他的经验来说并不难。
* 再添加一些简单的 UI 界面，来展示图层列表和最终的预览效果。
* 最后支持几个简单的功能，比如移动图层、隐藏图层、导出 JPG 图片等等。

这么点需求显然难不倒伊万。在 2013 年，伊万做出了第一个版本，这就是 Photopea 的起点了：

photopea-begin.jpg

伊万在把这个版本发布试用之后，获得了出乎意外的好反响。于是，他决定持续维护这个项目，解决用户的需求，这一维护就做到了今天。一晃六年过去了，现在的 Photopea 是怎样的呢？

photopea-now.jpg

这是现在的 Photopea。你可以看到，最早左侧寥寥无几的工具栏如今已经被填满了，滤镜、蒙版、钢笔、文字、魔棒、曲线等功能更是一应俱全。除了完全支持 PSD 文件和 PNG / JPG / RAW / SVG 等图像格式外，它甚至还能编辑 UI 设计师耳熟能详的 Sketch 文件。这个强大的作品，得到了全世界用户的广泛认可。它到底有多受欢迎呢？举几个数据吧：

* Photopea 的用户量，六年来每年至少增长三到四倍。现在它的每月访问量已经达到了 280 万次，每天用户花费 5500 个小时使用它。
* 人们每天用 Google 搜索约 10000 次 “photopea”。在 Google 搜索 “online PS” 和 “online photoshop” 关键词的时候，Photopea 都排在第一名，甚至超过了 Adobe 自己的 Flash 版本。
* 伊万在国外的 Reddit 网站上和网友互动介绍 Photopea 的「你问我答」活动，获得了四万多个赞同和超过 2000 条评论。
* 全世界的志愿者无偿地将 Photopea 翻译成了 35 种不同的语言。其中，笔者也贡献了若干中文翻译 :)

别以为 Photopea 只靠抄抄 PS 的界面就能这么火爆。这样的图片编辑器，其实是个非常挑战 Web 技术极限的产品。Photopea 的界面之下，隐藏了许多伊万的独门武功，许多技术指标迄今仍然独步天下。举几个一般人也很容易理解的例子：

* 图像的数据量，是随其尺寸而平方级递增的。一份尺寸 4000x4000，包含十个图层的文档，其内存占用就是单张 1000x1000 图片的 4x4x10 = 160 倍。以每个像素 4 字节计算，它在内存中的数据量就达到了 10x4000x4000x4 = 640MB。如果用每秒 60 帧的频率更新，就意味着每秒要在网页中处理 38GB 的图像数据！这是对于普通程序员来说非常罕见的挑战。Photopea 使用了浏览器底层的硬件加速技术，能够控制 GPU 来处理图像，打开这一量级的文档时也能保证基本的可用性。
* 对于一般的 Web 应用，Chrome 和 Firefox 等浏览器是非常稳定的。但对于 Photopea 这样极致压榨性能的应用来说，许多极端情形都能让浏览器这样的互联网基础设施暴露出问题。截至今天，Photopea 已经向 Chrome 反馈了约 50 个 bug，向 Firefox 反馈了约 30 个 bug。这些 bug 多数是与特定操作系统底层相关的困难 bug，只能在操作系统甚至硬件驱动的层面上修复。到现在，长期和浏览器团队打交道的伊万，甚至已经可以绕过标准的浏览器 bug 反馈流程，直接写邮件找 Chrome 团队的开发者交流，帮助他们改进。某种程度上，Photopea 帮助改善了浏览器的稳定性。
* 现在的 Web 应用正在变得日趋膨胀。打开淘宝、网易等网站的首页时， 其数据传输量几乎不可能低于 2MB。那么像 Photopea 这样功能强大得多的应用，它的体积表现又如何呢？为了追求极致，伊万几乎完全不使用第三方代码库，并自己开发了代码的压缩混淆工具。最终的产物包含了 7.4 万行代码，但整个应用的体积仍然只有 1.4MB。
* 几乎你能看到的每一个知名网站，都有相当高昂的服务器运维成本。谷歌有几十万台服务器，一年的成本是天文数字。猜猜 Photopea 一年的服务器维护成本有多高？20000 美元？2000 美元？答案是——20 美元。由于 Photopea 坚持使用浏览器自身的能力，不传输用户作图数据到服务端，这既使得它的运维成本几乎为零，也很好地保护了用户隐私。

现在的 Photopea，已经完全是个成熟的商业级产品了。那么，Photopea 的背后也有一支成熟的团队在维护它吗？伊万的故事里最为不可思议的一点，在于即便到了今天，所有 Photopea 的工作，包括开发新功能、修复 bug、听取用户反馈到发布官方博客，仍然只由他自己完成！伊万没有成立公司，你基本可以把 Photopea 的官方支持邮箱，当作他的个人邮件地址。光是单枪匹马地开发运营 Photopea，就已经够不可思议了，不仅如此，伊万还开源了不少 Photopea 的自研技术，包括字体解析、PNG 图片编解码和本地化支持等等。

TODO 盈利 朴素 魔方 稿定