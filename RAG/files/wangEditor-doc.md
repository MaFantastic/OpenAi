## wangEditor 简介

wangEditor 是一个轻量的富文本编辑器，支持多语言界面、可定制菜单和多种输出格式。其核心特性包括丰富的内置菜单、可插拔扩展体系以及易于同框架集成的 API。

### 快速开始

1. 引入样式与脚本：`import '@wangeditor/editor/dist/css/style.css'`，再 `createEditor` 创建实例。
2. 组合菜单：通过 `createToolbar` 指定想要展示的按钮，例如加粗、图片、代码块。
3. 监听变化：在 `onChange` 回调里实时获取 `editor.getHtml()` 或 JSON Delta。

### 常见配置

- `MENU_CONF['uploadImage']` 可自定义图片上传地址、大小限制和额外 header。
- `editor.getConfig().hoverbarKeys` 控制悬浮工具栏展示的菜单项。
- `editor.destroy()` 必须在组件卸载时调用，避免内存泄露。

### 使用技巧

- 在 Vue/React 场景下，保持 `editorRef.value` 或 `useRef` 指向唯一实例。
- 表单提交前可用 `editor.txt.html()` 生成 HTML，再配合后端白名单过滤。
- 通过 `customAlert` 钩子可以把编辑器内部的提示统一交给业务层处理。

