# 《JavaScript 20 年》引用转换相关资料

本目录下的最终产物内容，只需关注这部分即可：

* `part-all.html` - 调整过引用格式后生成的 HTML 文件
* `online-refs.md` - 与 `part-all.html` 相配套的参考文献链接

> 本目录下未包含附录、脚注和在线版参考文献对应的 markdown 文件，可认为它们的内容与在线版保持一致。


与最终产物相关的源文件：

* `part-x.md` / `notes.md` - 原有的在线版 markdown 文件
* `jshopl.bib` - 由原作者提供的 BibTeX 格式引用文件
* `jshopl.json` - 由 BibTeX 格式引用文件转换生成的 JSON 格式文件

用于进行转换的代码，需依赖 Node.js：

* `bib-parser.js` - 针对 BibTeX 文件的转换库
* `bib-converter.js` - 从 BibTeX 文件生成 `jshopl.json` 文件的脚本
* `ref-converter.js` - 基于原文的 markdown 文件与 `jshopl.json`，生成 `online-refs.md` 文件的脚本
