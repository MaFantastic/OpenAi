# 菜单配置

本文是各个菜单项的详细配置。如想要自定义工具栏的菜单（隐藏某些菜单、排序、分组等），请参考[工具栏配置](/v5/toolbar-config.html)。

## 通用方法

### 确定 menu key

要配置哪个菜单，首先要知道这个菜单的 key 。执行 `editor.getAllMenuKeys()` 可获取编辑器所有菜单，从中找到自己想要的菜单 key 即可。

### 获取菜单的默认配置

找到菜单 key 之后，可以先看看菜单的当前配置，再自行修改。

```ts
editor.getMenuConfig('uploadImage') // 获取 uploadImage 的当前配置
```

### 修改配置

```ts
import { IEditorConfig } from '@wangeditor/editor'

// 初始化 MENU_CONF 属性
const editorConfig: Partial<IEditorConfig> = {
  // TS 语法
  // const editorConfig = {                       // JS 语法
  MENU_CONF: {},

  // 其他属性...
}

// 修改 uploadImage 菜单配置
editorConfig.MENU_CONF['uploadImage'] = {
  server: '/api/upload-image',
  fieldName: 'custom-field-name',
  // 继续写其他配置...

  //【注意】不需要修改的不用写，wangEditor 会去 merge 当前其他配置
}

// 修改 otherMenuKey 菜单配置
editorConfig.MENU_CONF['otherMenuKey'] = {
  // 配置
}

// 创建 editor 或传入 Vue React <Editor> 组件
```

## 颜色

```ts
// 文字颜色
editorConfig.MENU_CONF['color'] = {
  colors: ['#000', '#333', '#666'],
}

// 背景色
editorConfig.MENU_CONF['bgColor'] = {
  colors: ['#000', '#333', '#666'],
}
```

## 字号

```ts
editorConfig.MENU_CONF['fontSize'] = {
  fontSizeList: [
    // 元素支持两种形式
    //   1. 字符串；
    //   2. { name: 'xxx', value: 'xxx' }

    '12px',
    '16px',
    { name: '24px', value: '24px' },
    '40px',
  ],
}
```

## 字体

:::tip
请注意，某些字体不能商用。具体请自行查找。
:::

```ts
editorConfig.MENU_CONF['fontFamily'] = {
  fontFamilyList: [
    // 元素支持两种形式
    //   1. 字符串；
    //   2. { name: 'xxx', value: 'xxx' }

    '黑体',
    '楷体',
    { name: '仿宋', value: '仿宋' },
    'Arial',
    'Tahoma',
    'Verdana',
  ],
}
```

## 行高

```ts
editorConfig.MENU_CONF['lineHeight'] = {
  lineHeightList: ['1', '1.5', '2', '2.5'],
}
```

## 表情

```ts
editorConfig.MENU_CONF['emotion'] = {
  emotions: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉'.split(' '), // 数组
}
```

## 链接

- `checkLink` 校验链接
- `parseLinkUrl` 转换链接 url

```ts
// 自定义校验链接
function customCheckLinkFn(
  text: string,
  url: string
): string | boolean | undefined {
  // TS 语法
  // function customCheckLinkFn(text, url) {                                              // JS 语法

  if (!url) {
    return
  }
  if (url.indexOf('http') !== 0) {
    return '链接必须以 http/https 开头'
  }
  return true

  // 返回值有三种选择：
  // 1. 返回 true ，说明检查通过，编辑器将正常插入链接
  // 2. 返回一个字符串，说明检查未通过，编辑器会阻止插入。会 alert 出错误信息（即返回的字符串）
  // 3. 返回 undefined（即没有任何返回），说明检查未通过，编辑器会阻止插入。但不会提示任何信息
}

// 自定义转换链接 url
function customParseLinkUrl(url: string): string {
  // TS 语法
  // function customParseLinkUrl(url) {                // JS 语法

  if (url.indexOf('http') !== 0) {
    return `http://${url}`
  }
  return url
}

// 插入链接
editorConfig.MENU_CONF['insertLink'] = {
  checkLink: customCheckLinkFn, // 也支持 async 函数
  parseLinkUrl: customParseLinkUrl, // 也支持 async 函数
}
// 更新链接
editorConfig.MENU_CONF['editLink'] = {
  checkLink: customCheckLinkFn, // 也支持 async 函数
  parseLinkUrl: customParseLinkUrl, // 也支持 async 函数
}
```

## 图片

如果用于 Typescript ，需定义图片元素类型。可单独放在 `.d.ts` 中定义。

```ts
import { SlateElement } from '@wangeditor/editor'

type ImageElement = SlateElement & {
  src: string
  alt: string
  url: string
  href: string
}
```

图片菜单的配置

- `onInsertedImage` 插入图片之后的回调
- `onUpdatedImage` 更新图片之后的回调
- `checkImage` 校验图片链接
- `parseImageSrc` 转换图片链接

```ts
// 自定义校验图片
function customCheckImageFn(
  src: string,
  alt: string,
  url: string
): boolean | undefined | string {
  // TS 语法
  // function customCheckImageFn(src, alt, url) {                                                    // JS 语法
  if (!src) {
    return
  }
  if (src.indexOf('http') !== 0) {
    return '图片网址必须以 http/https 开头'
  }
  return true

  // 返回值有三种选择：
  // 1. 返回 true ，说明检查通过，编辑器将正常插入图片
  // 2. 返回一个字符串，说明检查未通过，编辑器会阻止插入。会 alert 出错误信息（即返回的字符串）
  // 3. 返回 undefined（即没有任何返回），说明检查未通过，编辑器会阻止插入。但不会提示任何信息
}

// 转换图片链接
function customParseImageSrc(src: string): string {
  // TS 语法
  // function customParseImageSrc(src) {               // JS 语法
  if (src.indexOf('http') !== 0) {
    return `http://${src}`
  }
  return src
}

// 插入图片
editorConfig.MENU_CONF['insertImage'] = {
  onInsertedImage(imageNode: ImageElement | null) {
    // TS 语法
    // onInsertedImage(imageNode) {                    // JS 语法
    if (imageNode == null) return

    const { src, alt, url, href } = imageNode
    console.log('inserted image', src, alt, url, href)
  },
  checkImage: customCheckImageFn, // 也支持 async 函数
  parseImageSrc: customParseImageSrc, // 也支持 async 函数
}
// 编辑图片
editorConfig.MENU_CONF['editImage'] = {
  onUpdatedImage(imageNode: ImageElement | null) {
    // TS 语法
    // onUpdatedImage(imageNode) {                    // JS 语法
    if (imageNode == null) return

    const { src, alt, url } = imageNode
    console.log('updated image', src, alt, url)
  },
  checkImage: customCheckImageFn, // 也支持 async 函数
  parseImageSrc: customParseImageSrc, // 也支持 async 函数
}
```

## 上传图片

上传图片的配置比较复杂，拆分为几个部分来讲解。可参考这个 [demo](https://github.com/wangeditor-team/server)。

```ts{2}
editorConfig.MENU_CONF['uploadImage'] = {
    // 上传图片的配置
}
```

### 服务端地址

**必填**，否则上传图片会报错。

```ts
editorConfig.MENU_CONF['uploadImage'] = {
  server: '/api/upload',
}
```

**【特别注意】服务端 response body 格式要求如下：**<br>
上传成功的返回格式：

```ts
{
    "errno": 0, // 注意：值是数字，不能是字符串
    "data": {
        "url": "xxx", // 图片 src ，必须
        "alt": "yyy", // 图片描述文字，非必须
        "href": "zzz" // 图片的链接，非必须
    }
}
```

上传失败的返回格式：

```ts
{
    "errno": 1, // 只要不等于 0 就行
    "message": "失败信息"
}
```

:::tip
如果你的服务端 response body 无法按照上述格式，可以使用下文的 `customInsert`
:::

### 基本配置

```ts
editorConfig.MENU_CONF['uploadImage'] = {
  // form-data fieldName ，默认值 'wangeditor-uploaded-image'
  fieldName: 'your-custom-name',

  // 单个文件的最大体积限制，默认为 2M
  maxFileSize: 1 * 1024 * 1024, // 1M

  // 最多可上传几个文件，默认为 100
  maxNumberOfFiles: 10,

  // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
  allowedFileTypes: ['image/*'],

  // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
  meta: {
    token: 'xxx',
    otherKey: 'yyy',
  },

  // 将 meta 拼接到 url 参数中，默认 false
  metaWithUrl: false,

  // 自定义增加 http  header
  headers: {
    Accept: 'text/x-json',
    otherKey: 'xxx',
  },

  // 跨域是否传递 cookie ，默认为 false
  withCredentials: true,

  // 超时时间，默认为 10 秒
  timeout: 5 * 1000, // 5 秒
}
```

### 回调函数

```ts
editorConfig.MENU_CONF['uploadImage'] = {
  // 上传之前触发
  onBeforeUpload(file: File) {
    // TS 语法
    // onBeforeUpload(file) {    // JS 语法
    // file 选中的文件，格式如 { key: file }
    return file

    // 可以 return
    // 1. return file 或者 new 一个 file ，接下来将上传
    // 2. return false ，不上传这个 file
  },

  // 上传进度的回调函数
  onProgress(progress: number) {
    // TS 语法
    // onProgress(progress) {       // JS 语法
    // progress 是 0-100 的数字
    console.log('progress', progress)
  },

  // 单个文件上传成功之后
  onSuccess(file: File, res: any) {
    // TS 语法
    // onSuccess(file, res) {          // JS 语法
    console.log(`${file.name} 上传成功`, res)
  },

  // 单个文件上传失败
  onFailed(file: File, res: any) {
    // TS 语法
    // onFailed(file, res) {           // JS 语法
    console.log(`${file.name} 上传失败`, res)
  },

  // 上传错误，或者触发 timeout 超时
  onError(file: File, err: any, res: any) {
    // TS 语法
    // onError(file, err, res) {               // JS 语法
    console.log(`${file.name} 上传出错`, err, res)
  },
}
```

### 自定义功能

如果用于 Typescript ，则要定义插入函数的类型。

```ts
type InsertFnType = (url: string, alt: string, href: string) => void
```

#### 自定义插入

如果你的服务端 response body 无法按照上文规定的格式，则无法插入图片，提示失败。<br>
但你可以使用 `customInsert` 来自定义插入图片。

```ts
editorConfig.MENU_CONF['uploadImage'] = {
  // 自定义插入图片
  customInsert(res: any, insertFn: InsertFnType) {
    // TS 语法
    // customInsert(res, insertFn) {                  // JS 语法
    // res 即服务端的返回结果

    // 从 res 中找到 url alt href ，然后插入图片
    insertFn(url, alt, href)
  },
}
```

#### 自定义上传

如果你不想使用 wangEditor 自带的上传功能，例如你要上传到阿里云 OSS 。<br>
可以通过 `customUpload` 来自定义上传。

```ts
editorConfig.MENU_CONF['uploadImage'] = {
  // 自定义上传
  async customUpload(file: File, insertFn: InsertFnType) {
    // TS 语法
    // async customUpload(file, insertFn) {                   // JS 语法
    // file 即选中的文件
    // 自己实现上传，并得到图片 url alt href
    // 最后插入图片
    insertFn(url, alt, href)
  },
}
```

#### 自定义选择图片

如果你不想使用 wangEditor 自带的选择文件功能，例如你有自己的图床，或者图片选择器。<br>
可以通过 `customBrowseAndUpload` 来自己实现选择图片、上传图片，并插入图片。

```ts
editorConfig.MENU_CONF['uploadImage'] = {
  // 自定义选择图片
  customBrowseAndUpload(insertFn: InsertFnType) {
    // TS 语法
    // customBrowseAndUpload(insertFn) {              // JS 语法
    // 自己选择文件
    // 自己上传文件，并得到图片 url alt href
    // 最后插入图片
    insertFn(url, alt, href)
  },
}
```

### base64 插入图片

```ts
editorConfig.MENU_CONF['uploadImage'] = {
  // 其他配置...

  // 小于该值就插入 base64 格式（而不上传），默认为 0
  base64LimitSize: 5 * 1024, // 5kb
}
```

### 获取已删除的图片

这是一个常见的需求。<br>
上传图片到编辑器，然后又把图片删除了。此时你可能想要拿到这张删除的图片，在服务器也把图片文件删了。

- 使用 [onInsertedImage](/v5/menu-config.html#图片) 来收集所有上传或者插入的图片，记录为 `imageList1`
- 最后保存编辑器内容之前，使用 `editor.getElemsByType('image')` 获取当前编辑器的所有图片，记录为 `imageList2`
- 对比 `imageList1` 和 `imageList2` ，两者的差异，就是删除过的图片

可能会有疑问：为何要在最后去对比？我想要在图片删除时就及时得到反馈。<br>
但，这样是不行的，因为图片删除了，还可能会被**撤销**回来。所以，一定要在最后去操作。

## 视频

如果用于 Typescript ，需定义视频元素类型。可单独放在 `.d.ts` 中定义。

```ts
import { SlateElement } from '@wangeditor/editor'

type VideoElement = SlateElement & {
  src: string
  poster?: string
}
```

菜单配置

- `onInsertedVideo` 插入视频之后的回调
- `checkVideo` 校验视频链接
- `parseVideoSrc` 转换视频链接

```ts
// 自定义校验视频
function customCheckVideoFn(
  src: string,
  poster: string
): boolean | string | undefined {
  // TS 语法
  // function customCheckVideoFn(src, poster) {                                             // JS 语法
  if (!src) {
    return
  }
  if (src.indexOf('http') !== 0) {
    return '视频地址必须以 http/https 开头'
  }
  return true

  // 返回值有三种选择：
  // 1. 返回 true ，说明检查通过，编辑器将正常插入视频
  // 2. 返回一个字符串，说明检查未通过，编辑器会阻止插入。会 alert 出错误信息（即返回的字符串）
  // 3. 返回 undefined（即没有任何返回），说明检查未通过，编辑器会阻止插入。但不会提示任何信息
}

// 自定义转换视频
function customParseVideoSrc(src: string): string {
  // TS 语法
  // function customParseVideoSrc(src) {               // JS 语法
  if (src.includes('.bilibili.com')) {
    // 转换 bilibili url 为 iframe （仅作为示例，不保证代码正确和完整）
    const arr = location.pathname.split('/')
    const vid = arr[arr.length - 1]
    return `<iframe src="//player.bilibili.com/player.html?bvid=${vid}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`
  }
  return src
}

editorConfig.MENU_CONF['insertVideo'] = {
  onInsertedVideo(videoNode: VideoElement | null) {
    // TS 语法
    // onInsertedVideo(videoNode) {                    // JS 语法
    if (videoNode == null) return

    const { src } = videoNode
    console.log('inserted video', src)
  },
  checkVideo: customCheckVideoFn, // 也支持 async 函数
  parseVideoSrc: customParseVideoSrc, // 也支持 async 函数
}
```

## 上传视频

上传视频的配置比较复杂，拆分为几个部分来讲解。可参考这个 [demo](https://github.com/wangeditor-team/server)。

```ts{2}
editorConfig.MENU_CONF['uploadVideo'] = {
    // 上传视频的配置
}
```

### 服务端地址

**必填**，否则上传视频会报错。

```ts
editorConfig.MENU_CONF['uploadVideo'] = {
  server: '/api/upload',
}
```

**【特别注意】服务端 response body 格式要求如下：**<br>
上传成功的返回格式：

```json
{
  "errno": 0, // 注意：值是数字，不能是字符串
  "data": {
    "url": "xxx", // 视频 src ，必须
    "poster": "xxx.png" // 视频封面图片 url ，可选
  }
}

// 注意：@wangeditor/editor 版本 >= 5.1.8 才支持 video poster
```

上传失败的返回格式：

```json
{
  "errno": 1, // 只要不等于 0 就行
  "message": "失败信息"
}
```

:::tip
如果你的服务端 response body 无法按照上述格式，可以使用下文的 `customInsert`
:::

### 基本配置

```ts
editorConfig.MENU_CONF['uploadVideo'] = {
  // form-data fieldName ，默认值 'wangeditor-uploaded-video'
  fieldName: 'your-custom-name',

  // 单个文件的最大体积限制，默认为 10M
  maxFileSize: 5 * 1024 * 1024, // 5M

  // 最多可上传几个文件，默认为 5
  maxNumberOfFiles: 3,

  // 选择文件时的类型限制，默认为 ['video/*'] 。如不想限制，则设置为 []
  allowedFileTypes: ['video/*'],

  // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
  meta: {
    token: 'xxx',
    otherKey: 'yyy',
  },

  // 将 meta 拼接到 url 参数中，默认 false
  metaWithUrl: false,

  // 自定义增加 http  header
  headers: {
    Accept: 'text/x-json',
    otherKey: 'xxx',
  },

  // 跨域是否传递 cookie ，默认为 false
  withCredentials: true,

  // 超时时间，默认为 30 秒
  timeout: 15 * 1000, // 15 秒

  // 视频不支持 base64 格式插入
}
```

### 回调函数

```ts
editorConfig.MENU_CONF['uploadVideo'] = {
  // 上传之前触发
  onBeforeUpload(file: File) {
    // TS 语法
    // onBeforeUpload(file) {      // JS 语法
    // file 选中的文件，格式如 { key: file }
    return file

    // 可以 return
    // 1. return file 或者 new 一个 file ，接下来将上传
    // 2. return false ，不上传这个 file
  },

  // 上传进度的回调函数
  onProgress(progress: number) {
    // TS 语法
    // onProgress(progress) {       // JS 语法
    // progress 是 0-100 的数字
    console.log('progress', progress)
  },

  // 单个文件上传成功之后
  onSuccess(file: File, res: any) {
    // TS 语法
    // onSuccess(file, res) {          // JS 语法
    console.log(`${file.name} 上传成功`, res)
  },

  // 单个文件上传失败
  onFailed(file: File, res: any) {
    // TS 语法
    // onFailed(file, res) {          // JS 语法
    console.log(`${file.name} 上传失败`, res)
  },

  // 上传错误，或者触发 timeout 超时
  onError(file: File, err: any, res: any) {
    // TS 语法
    // onError(file, err, res) {               // JS 语法
    console.log(`${file.name} 上传出错`, err, res)
  },
}
```

### 自定义功能

如果用于 Typescript ，则要定义插入函数的类型。

```ts
type InsertFnType = (url: string, poster: string = '') => void
```

#### 自定义插入

如果你的服务端 response body 无法按照上文规定的格式，则无法插入视频，提示失败。<br>
但你可以使用 `customInsert` 来自定义插入视频。

```ts
editorConfig.MENU_CONF['uploadVideo'] = {
  // 自定义插入视频
  customInsert(res: any, insertFn: InsertFnType) {
    // TS 语法
    // customInsert(res, insertFn) {                  // JS 语法
    // res 即服务端的返回结果

    // 从 res 中找到 url poster ，然后插入视频
    insertFn(url, poster)
  },
}
```

#### 自定义上传

如果你不想使用 wangEditor 自带的上传功能，例如你要上传到阿里云 OSS 。<br>
可以通过 `customUpload` 来自定义上传。

```ts
editorConfig.MENU_CONF['uploadVideo'] = {
  // 自定义上传
  async customUpload(file: File, insertFn: InsertFnType) {
    // TS 语法
    // async customUpload(file, insertFn) {                   // JS 语法
    // file 即选中的文件
    // 自己实现上传，并得到视频 url poster
    // 最后插入视频
    insertFn(url, poster)
  },
}
```

#### 自定义选择视频

如果你不想使用 wangEditor 自带的选择文件功能，例如你有自己的图床，或者视频文件选择器。<br>
可以通过 `customBrowseAndUpload` 来自己实现选择视频、上传视频，并插入视频。

```ts
editorConfig.MENU_CONF['uploadVideo'] = {
  // 自定义选择视频
  customBrowseAndUpload(insertFn: InsertFnType) {
    // TS 语法
    // customBrowseAndUpload(insertFn) {             // JS 语法
    // 自己选择文件
    // 自己上传文件，并得到视频 url poster
    // 最后插入视频
    insertFn(url, poster)
  },
}
```

## 代码高亮

- `codeLangs` 配置代码语言

```ts
editorConfig.MENU_CONF['codeSelectLang'] = {
  // 代码语言
  codeLangs: [
    { text: 'CSS', value: 'css' },
    { text: 'HTML', value: 'html' },
    { text: 'XML', value: 'xml' },
    // 其他
  ],
}
```

:::tip
配置代码语言时，只能从 `editor.getMenuConfig('codeSelectLang').codeLangs` 中选择，不能自己随意增加。
如有其他语言的需要，可以给我们提交 issue ，这需要修改源码。
:::

## 其他

其他菜单的配置，请参考上文的 [通用方法](#通用方法) 自行修改。

# 节点数据结构

wangEditor 是基于 slate.js 为内核开发的，所以学习本文之前，要先了解 [slate Node 设计](https://docs.slatejs.org/concepts/02-nodes) 。

## 是什么

很多同学可能根本不知道本文要讲什么，对于这里的“节点”和“数据结构”也不知何意。<br>
没关系，接下来通过几个问题，就可以让你快速入门。

我们通过 [API](/v5/API.html) 的学习，已经知道了 wangEditor 有丰富的 API 可供使用。<br>
那么问题来了：

- `editor.addMark(key, value)` 可以设置文本样式，如何设置删除线呢？此时 `key` `value` 该怎么写？
- `editor.insertNode(node)` 可以插入一个节点，如何插入一个链接呢？此时 `node` 该怎么写？
- `SlateTransforms.setNodes(editor, {...})` 可以设置节点的属性，如何设置行高呢？此时 `{...}` 这个属性该怎么写？

通过上述问题，你大概知道了本文的目的 —— 就是告诉你，编辑器内所有内容、节点的数据结构 —— 它们都是由哪些数据构成的。

## 快速了解

如果想快速了解各个节点的数据结构，其实方法很简单。
- 创建一个编辑器，操作一下
- 查看 `editor.children`

例如，写一段文字、设置一个标题或列表，查看 `editor.children` 即可看到他们的数据结构

![](/image/数据结构-1.png)

再例如，对文字设置行高，设置文本样式，查看 `editor.children` 即可看到他们的数据结构

![](/image/数据结构-2.png)

## Text Node

文本节点，例如 `{ text: 'hello' }` **必须有 `text` 属性**。还可以自定义属性，例如加粗的文本可表示为 `{ text: 'hello', bold: true }` ，其他属性可自行扩展。

注意，文本节点是底层节点，所以没有子节点，**没有 `children` 属性**。

## Element Node

元素节点，例如 `{ type: 'header1', children: [ { text: 'hello' } ] }` **必须有两个属性 `type` 和 `children` 属性**。还可以自定义属性，例如居中对齐可表示为 `{ type: 'header1', textAlign: 'center', children: [ { text: 'hello' } ] }` ，其他属性自行扩展。


## Inline Element

元素默认是 block 显示，即占满一整行。但有些元素需要变为 inline 显示，如 `<img>` `<a>` 等。

我们可以**通过[插件](./development.md#劫持编辑器事件和操作-插件)来修改 `isInline` 把一个元素改为 inline** ，参考链接元素的[插件源码](https://github.com/wangeditor-team/wangEditor/blob/master/packages/basic-modules/src/modules/link/plugin.ts)。

## Void Element

有些元素需要定义为 void 类型（即没有子节点），例如 `<img>` `<video>` 等。

我们可以**通过[插件](./development.md#劫持编辑器事件和操作-插件)来修改 `isVoid` 把一个元素改为 void** ，参考图片元素的[插件源码](https://github.com/wangeditor-team/wangEditor/blob/master/packages/basic-modules/src/modules/image/plugin.ts)。

注意，void 类型虽然在语义上没有子节点，但 slate.js 规定，**它必须有一个 `children` 属性，其中只有一个空字符串**。例如图片元素：

```js
{
    type: 'image',
    // 其他属性 ...
    children: [{ text: '' }] // void 元素必须有一个 children ，其中只有一个空字符串，重要！！！
}
```

# 自定义扩展新功能

wangEditor 从 V5 开始，源码上就分离了 core editor 还有各个 module 。<br>
core 是核心 API ，editor 负责汇总集成。所有的具体功能，都分布在各个 module 中来实现。

![](/image/架构图.png)

基于这种扩展性，官方开发了几个常用的[插件](./plugins.md)，其源码也可作为二次开发的参考。

## 注册新菜单

菜单分为几种

- ButtonMenu 按钮菜单，如 加粗、斜体
- SelectMenu 下拉菜单，如 标题、字体、行高
- DropPanelMenu 下拉面板菜单，如 字体颜色、创建表格
- ModalMenu 弹出框菜单，如 插入链接、插入网络图片

### ButtonMenu

可参考这个 [demo](https://www.wangeditor.com/demo/extend-menu.html) 网页源码。在实际开发中，会用到很多 editor [API](./API.md) 。

第一，定义菜单 class

```ts
import { IButtonMenu, IDomEditor } from '@wangeditor/editor'

class MyButtonMenu implements IButtonMenu {
  // TS 语法
  // class MyButtonMenu {                       // JS 语法

  constructor() {
    this.title = 'My menu title' // 自定义菜单标题
    // this.iconSvg = '<svg>...</svg>' // 可选
    this.tag = 'button'
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(editor: IDomEditor): string | boolean {
    // TS 语法
    // getValue(editor) {                              // JS 语法
    return ' hello '
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(editor: IDomEditor): boolean {
    // TS 语法
    // isActive(editor) {                    // JS 语法
    return false
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor: IDomEditor): boolean {
    // TS 语法
    // isDisabled(editor) {                     // JS 语法
    return false
  }

  // 点击菜单时触发的函数
  exec(editor: IDomEditor, value: string | boolean) {
    // TS 语法
    // exec(editor, value) {                              // JS 语法
    if (this.isDisabled(editor)) return
    editor.insertText(value) // value 即 this.value(editor) 的返回值
  }
}
```

第二，[注册菜单到 wangEditor](#注册菜单到-wangeditor)

第三，[插入菜单到工具栏](#插入菜单到工具栏)

到此，自定义菜单就已经注册成功了，参考这个 [demo](https://www.wangeditor.com/demo/extend-menu.html)

### SelectMenu

可参考这个 [demo](https://www.wangeditor.com/demo/extend-menu-select.html) 网页源码。在实际开发中，会用到很多 editor [API](./API.md) 。

第一，定义菜单 class

```ts
import { IDomEditor, ISelectMenu } from '@wangeditor/editor'

class MySelectMenu implements ISelectMenu {
  // TS 语法
  // class MySelectMenu {                       // JS 语法

  constructor() {
    ;(this.title = 'My Select Menu'), (this.tag = 'select')
    this.width = 60
  }

  // 下拉框的选项
  getOptions(editor: IDomEditor) {
    // TS 语法
    // getOptions(editor) {            // JS 语法
    const options = [
      {
        value: 'beijing',
        text: '北京',
        styleForRenderMenuList: { 'font-size': '32px', 'font-weight': 'bold' },
      },
      { value: 'shanghai', text: '上海', selected: true },
      { value: 'shenzhen', text: '深圳' },
    ]
    return options
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(editor: IDomEditor): boolean {
    // TS 语法
    // isActive(editor) {                      // JS 语法
    return false
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(editor: IDomEditor): string | boolean {
    // TS 语法
    // getValue(editor) {                               // JS 语法
    return 'shanghai' // 匹配 options 其中一个 value
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor: IDomEditor): boolean {
    // TS 语法
    // isDisabled(editor) {                     // JS 语法
    return false
  }

  // 点击菜单时触发的函数
  exec(editor: IDomEditor, value: string | boolean) {
    // TS 语法
    // exec(editor, value) {                              // JS 语法
    // Select menu ，这个函数不用写，空着即可
  }
}
```

第二，[注册菜单到 wangEditor](#注册菜单到-wangeditor)

第三，[插入菜单到工具栏](#插入菜单到工具栏)

到此，自定义菜单就已经注册成功了，参考这个 [demo](https://www.wangeditor.com/demo/extend-menu-select.html)

### DropPanelMenu

可参考这个 [demo](https://www.wangeditor.com/demo/extend-menu-drop-panel.html) 网页源码。在实际开发中，会用到很多 editor [API](./API.md) 。

第一，定义菜单 class

```ts
import { IDomEditor, IDropPanelMenu } from '@wangeditor/editor'

class MyDropPanelMenu implements IDropPanelMenu {
  // TS 语法
  // class MyDropPanelMenu {                           // JS 语法

  constructor() {
    this.title = 'My menu'
    // this.iconSvg = '<svg >...</svg>'
    this.tag = 'button'
    this.showDropPanel = true
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(editor: IDomEditor): boolean {
    // TS 语法
    // isActive(editor) {                      // JS 语法
    return false
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(editor: IDomEditor): string | boolean {
    // TS 语法
    // getValue(editor) {                               // JS 语法
    return ''
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor: IDomEditor): boolean {
    // TS 语法
    // isDisabled(editor) {                     // JS 语法
    return false
  }

  // 点击菜单时触发的函数
  exec(editor: IDomEditor, value: string | boolean) {
    // TS 语法
    // exec(editor, value) {                              // JS 语法
    // DropPanel menu ，这个函数不用写，空着即可
  }

  // 定义 DropPanel 内部的 DOM Element
  getPanelContentElem(editor: IDomEditor): DOMElement {
    // TS 语法
    // getPanelContentElem(editor) {                        // JS 语法
    const $list = $(`<ul>
            <li>北京</li> <li>上海</li> <li>深圳</li>
          </ul>`)

    $list.on('click', 'li', function () {
      editor.insertText(this.innerHTML)
      editor.insertText(' ')
    })

    return $list[0] // 返回 DOM Element 类型

    // PS：也可以把 $list 缓存下来，这样不用每次重复创建、重复绑定事件，优化性能
  }
}
```

第二，[注册菜单到 wangEditor](#注册菜单到-wangeditor)

第三，[插入菜单到工具栏](#插入菜单到工具栏)

到此，自定义菜单就已经注册成功了，参考这个 [demo](htthttps://www.wangeditor.com/demo/extend-menu-drop-panel.html)

### ModalMenu

可参考这个 [demo](https://www.wangeditor.com/demo/extend-menu-modal.html) 网页源码。在实际开发中，会用到很多 editor [API](./API.md) 。

第一，定义菜单 class

```ts
import { IDomEditor, IModalMenu, SlateNode } from '@wangeditor/editor'

class MyModalMenu implements IModalMenu {
  // TS 语法
  // class MyModalMenu {                       // JS 语法

  constructor() {
    this.title = 'My menu'
    // this.iconSvg = '<svg >...</svg>'
    this.tag = 'button'
    this.showModal = true
    this.modalWidth = 300
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(editor: IDomEditor): boolean {
    // TS 语法
    // isActive(editor) {                      // JS 语法
    return false
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(editor: IDomEditor): string | boolean {
    // TS 语法
    // getValue(editor) {                               // JS 语法
    return ''
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor: IDomEditor): boolean {
    // TS 语法
    // isDisabled(editor) {                     // JS 语法
    return false
  }

  // 点击菜单时触发的函数
  exec(editor: IDomEditor, value: string | boolean) {
    // TS 语法
    // exec(editor, value) {                              // JS 语法
    // Modal menu ，这个函数不用写，空着即可
  }

  // 弹出框 modal 的定位：1. 返回某一个 SlateNode； 2. 返回 null （根据当前选区自动定位）
  getModalPositionNode(editor: IDomEditor): SlateNode | null {
    // TS 语法
    // getModalPositionNode(editor) {                             // JS 语法
    return null // modal 依据选区定位
  }

  // 定义 modal 内部的 DOM Element
  getModalContentElem(editor: IDomEditor): DOMElement {
    // TS 语法
    // getModalContentElem(editor) {                        // JS 语法

    const $content = $('<div></div>')
    const $button = $('<button>do something</button>')
    $content.append($button)

    $button.on('click', () => {
      editor.insertText(' hello ')
    })

    return $content[0] // 返回 DOM Element 类型

    // PS：也可以把 $content 缓存下来，这样不用每次重复创建、重复绑定事件，优化性能
  }
}
```

第二，[注册菜单到 wangEditor](#注册菜单到-wangeditor)

第三，[插入菜单到工具栏](#插入菜单到工具栏)

到此，自定义菜单就已经注册成功了，参考这个 [demo](https://www.wangeditor.com/demo/extend-menu-modal.html)

#### 用 Vue React 组件实现 modal

如果你用 Vue React 开发了 modal 组件，想通过菜单来显示/隐藏

- 不用 ModalMenu ，改用最简单的 ButtonMenu
- 在 `exec` 函数中通过自定义事件（或其他方式）来控制 modal 组件的显示和隐藏

可再参考这个分享：[在 React 中更方便的扩展 Menu ，替代原有的 ModalMenu 方案](https://github.com/wangeditor-team/wangEditor/issues/4598)

### 注册菜单到 wangEditor

先根据菜单 class 来定义菜单配置

```js
const menu1Conf = {
  key: 'menu1', // 定义 menu key ：要保证唯一、不重复（重要）
  factory() {
    return new YourMenuClass() // 把 `YourMenuClass` 替换为你菜单的 class
  },
}
// const menu2Conf = { ... }
// const menu3Conf = { ... }
```

然后，再把菜单注册到 wangEditor 。有两种选择：

第一，如果只注册一个菜单，没有别的功能了，则推荐使用 `registerMenu`

```ts
import { Boot } from '@wangeditor/editor'

Boot.registerMenu(menu1Conf)
```

第二，如果除了菜单之外还要同时注册其他能力，则建议使用 `registerModule`

```ts
import { Boot, IModuleConf } from '@wangeditor/editor'

const module: Partial<IModuleConf> = {
  // TS 语法
  // const module = {                      // JS 语法

  menus: [menu1Conf, menu2Conf, menu3Conf],

  // 其他功能，下文讲解...
}
Boot.registerModule(module)
```

:::tip

- 必须在创建编辑器之前注册
- 全局只能注册一次，不要重复注册
  :::

### 插入菜单到工具栏

在创建编辑器（或渲染 Vue React 组件时）注册到工具栏，可选择以下方式

- 注册到工具栏 [insertKeys](./toolbar-config.md#insertkeys)
- 注册到悬浮菜单 [hoverbarKeys](./editor-config.md#hoverbarkeys)

## 劫持编辑器事件和操作（插件）

如[支持 markdown 语法](https://github.com/wangeditor-team/wangEditor-plugin-md)，以及 [ctrl + enter 回车](https://github.com/wangeditor-team/wangEditor-plugin-ctrl-enter)等。可参考它们的源码。

### 定义插件

在实际开发中，会用到很多 editor [API](./API.md) 。

```ts
import { IDomEditor } from '@wangeditor/editor'

function withBreakAndDelete<T extends IDomEditor>(editor: T): T {
  // TS 语法
  // function withBreakAndDelete(editor) {                            // JS 语法

  const { insertBreak, deleteBackward } = editor // 获取当前 editor API
  const newEditor = editor

  // 重写 insertBreak 换行
  newEditor.insertBreak = () => {
    // if: 是 ctrl + enter ，则执行 insertBreak
    insertBreak()

    // else: 则不执行换行
    return
  }

  // 重写 deleteBackward 向后删除
  newEditor.deleteBackward = (unit) => {
    // if： 某种情况下，执行默认的删除
    deleteBackward(unit)

    // else: 其他情况，则不执行删除
    return
  }

  // 重写其他 API ...

  // 返回 newEditor ，重要！
  return newEditor
}
```

### 注册插件到 wangEditor

有两种方式。

第一，如果你仅仅注册一个插件，没有别的需求，则推荐使用 `registerPlugin`

```ts
import { Boot } from '@wangeditor/editor'

Boot.registerPlugin(withBreakAndDelete)
```

第二，如果你除了注册插件之外，同时还注册其他功能，则推荐使用 `registerModule`

```ts
import { Boot, IModuleConf } from '@wangeditor/editor'

const module: Partial<IModuleConf> = {
  // TS 语法
  // const module = {                      // JS 语法

  // menus: [menu1Conf, menu2Conf, menu3Conf], // 菜单
  editorPlugin: withBreakAndDelete, // 插件

  // 其他功能，下文讲解...
}
Boot.registerModule(module)
```

:::tip

- 必须在创建编辑器之前注册
- 全局只能注册一次，不要重复注册
  :::

至此一个插件就注册完成，可以监听编辑器的 `insertBreak` 和 `deleteBackward` 事件。

## 定义新元素

编辑器默认只有基本的标题、列表、文字、图片、表格等元素，如果你想让编辑器渲染一个新元素，如 [附件](https://github.com/wangeditor-team/wangEditor-plugin-upload-attachment) [数学公式](https://github.com/wangeditor-team/wangEditor-plugin-formula) [链接卡片](https://github.com/wangeditor-team/wangEditor-plugin-link-card) 等，你就需要根据本节内容来定义。

编辑器的输入和输出通常都是 HTML ，但其内部却有复杂的渲染机制，主要过程是：**model -> 生成 vdom -> 渲染 DOM**，如下图。

所以，我们也需要了解很多知识，定义很多函数来完成这一功能。不过别担心，它其实并难理解，跟着文档一步一步操作即可。

![](/image/extend-api.png)

### 定义节点数据结构

数据驱动视图，这也是 Vue React 设计思路。要想显示什么，必须先定义相应的数据结构。

在此需要你详细了解 wangEditor [节点数据结构](./node-define.md)的相关知识，并熟悉以下知识点：

- Text node 和 Element node 区别
- 如何扩展 Text node 和 Element node 属性
- 如何设置 Inline node
- 如何设置 Void node ，以及它的 `children` 有何特点

例如，对“附件”元素，我们设计为： `type: 'attachment'` + inline + void ，然后扩展一些必要的属性，数据结构示例：

```ts
const myResume: AttachmentElement = {  // TS 语法
// const resume = {                    // JS 语法
  type: 'attachment'
  fileName: 'resume.pdf'
  link: 'https://xxx.com/files/resume.pdf'
  children: [{ text: '' }]  // void 元素必须有一个 children ，其中只有一个空字符串，重要！！！
}
```

如果你使用 TS ， `AttachmentElement` 的定义在[这里](https://github.com/wangeditor-team/wangEditor-plugin-upload-attachment/blob/main/src/module/custom-types.ts)。

### 定义 inline 和 void

我们把“附件”元素设计为 inline 和 void ，就需要在代码中体现出来。

第一，定义一个插件，重写 `isInline` 和 `isVoid` API

```ts
import { DomEditor, IDomEditor } from '@wangeditor/editor'

function withAttachment<T extends IDomEditor>(editor: T) {
  // TS 语法
  // function withAttachment(editor) {                        // JS 语法
  const { isInline, isVoid } = editor
  const newEditor = editor

  newEditor.isInline = (elem) => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'attachment') return true // 针对 type: attachment ，设置为 inline
    return isInline(elem)
  }

  newEditor.isVoid = (elem) => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'attachment') return true // 针对 type: attachment ，设置为 void
    return isVoid(elem)
  }

  return newEditor // 返回 newEditor ，重要！！！
}
```

第二，把插件 `withAttachment` 注册到 wangEditor ，参考[上文](#注册插件到-wangeditor)。

### 在编辑器中渲染新元素

数据结构定义好了，但编辑器现在还不认识它，执行 `editor.insertNode(myResume)` 也不会有任何效果。接下来就需要让编辑器认识它，能根据 `myResume` 的数据，渲染出我们想要的 UI 界面。

#### 安装 snabbdom.js

```shell
yarn add snabbdom --peer
## 安装到 package.json 的 peerDependencies 中即可
```

编辑器的内部渲染使用了 VDOM 技术，[snabbdom.js](https://github.com/snabbdom/snabbdom) 是一个优秀的 VDOM diff 工具。

我们主要会用到它的 `h` 函数，你可以先在[文档](https://github.com/snabbdom/snabbdom#h)中了解一下。

#### 定义 renderElem 函数

以下是“附件”元素 renderElem 的代码示例，完整代码请参考它的[源码](https://github.com/wangeditor-team/wangEditor-plugin-upload-attachment/blob/main/src/module/render-elem.ts)

```ts
import { h, VNode } from 'snabbdom'
import { IDomEditor, SlateElement } from '@wangeditor/editor'

/**
 * 渲染“附件”元素到编辑器
 * @param elem 附件元素，即上文的 myResume
 * @param children 元素子节点，void 元素可忽略
 * @param editor 编辑器实例
 * @returns vnode 节点（通过 snabbdom.js 的 h 函数生成）
 */
function renderAttachment(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {  // TS 语法
// function renderAttachment(elem, children, editor) {                                                // JS 语法

    // 获取“附件”的数据，参考上文 myResume 数据结构
    const { fileName = '', link = '' } = elem

    // 附件 icon 图标 vnode
    const iconVnode = h(
        // HTML tag
        'img',
        // HTML 属性
        {
            props: { src: 'xxxx.png' } // HTML 属性，驼峰式写法
            style: { width: '1em', marginRight: '0.1em',  /* 其他... */ } // HTML style ，驼峰式写法
        }
        // img 没有子节点，所以第三个参数不用写
    )

    // 附件元素 vnode
    const attachVnode = h(
        // HTML tag
        'span',
        // HTML 属性、样式、事件
        {
            props: { contentEditable: false }, // HTML 属性，驼峰式写法
            style: { display: 'inline-block', marginLeft: '3px', /* 其他... */ }, // style ，驼峰式写法
            on: { click() { console.log('clicked', link) }, /* 其他... */ }
        },
        // 子节点
        [ iconVnode, fileName ]
    )

    return attachVnode
}
```

#### 注册 renderElem 到 wangEditor

先定义 renderElem 配置

```js
const renderElemConf = {
  type: 'attachment', // 新元素 type ，重要！！！
  renderElem: renderAttachment,
}
```

然后把 `renderElemConf` 注册到 wangEditor ，有两种方式。

第一，如果你只想注册一个 renderElem ，没有其他功能，推荐使用 `registerRenderElem`

```js
import { Boot } from '@wangeditor/editor'

Boot.registerRenderElem(renderElemConf)
```

第二，如果你除了 renderElem 同时还要注册其他功能，推荐使用 `registerModule`

```ts
import { Boot, IModuleConf } from '@wangeditor/editor'

const module: Partial<IModuleConf> = {
  // TS 语法
  // const module = {                      // JS 语法

  // menus: [menu1Conf, menu2Conf, menu3Conf], // 菜单
  // editorPlugin: withBreakAndDelete, // 插件
  renderElems: [renderElemConf /* 其他元素... */], // renderElem

  // 其他功能，下文讲解...
}
Boot.registerModule(module)
```

:::tip

- 必须在创建编辑器之前注册
- 全局只能注册一次，不要重复注册
  :::

此时，你再执行 `editor.insertNode(myResume)` 就可以看到“附件”元素被渲染到了编辑器中。

### 把新元素转换为 HTML

当你把 `myResume` 插入到编辑器，并渲染成功，此时执行 `editor.getHtml()` 获取的 HTML 里并没有“附件”元素。接下来需要定义如何输入 HTML 。

#### 定义 elemToHtml 函数

以下是代码示例，完整源码可参考[这里](https://github.com/wangeditor-team/wangEditor-plugin-upload-attachment/blob/main/src/module/elem-to-html.ts)

```ts
import { SlateElement } from '@wangeditor/editor'

/**
 * 生成“附件”元素的 HTML
 * @param elem 附件元素，即上文的 myResume
 * @param childrenHtml 子节点的 HTML 代码，void 元素可忽略
 * @returns “附件”元素的 HTML 字符串
 */
function attachmentToHtml(elem: SlateElement, childrenHtml: string): string {
  // TS 语法
  // function attachmentToHtml(elem, childrenHtml) {                             // JS 语法

  // 获取附件元素的数据
  const { link = '', fileName = '' } = elem

  // 生成 HTML 代码
  const html = `<span
        data-w-e-type="attachment"
        data-w-e-is-void
        data-w-e-is-inline
        data-link="${link}"
        data-fileName="${fileName}"
    >${fileName}</span>`

  return html
}
```

注意以下事项：

- 自定义元素生成的 HTML tag 尽量使用 `<div>`（针对 block 元素） 或 `<span>`（针对 inline 元素）等通用标签。**谨慎使用 `<a>` `<p>` `<table>` 等编辑器默认支持的标签，那可能会带来冲突**。
- 使用 `data-w-e-type` 记录元素 `type` ，以便解析 HTML 时（下文讲）能识别到
- 使用 `data-w-e-is-void` 标记元素是 void ，以便解析 HTML 时能识别
- 使用 `data-w-e-is-inline` 标记元素是 inline ，以便解析 HTML 时能识别
- HTML 结构尽量扁平、简洁，这样更容易解析 HTML ，更稳定

#### 注册 elemToHtml 到 wangEditor

先定义 elemToHtml 配置

```ts
const elemToHtmlConf = {
  type: 'attachment', // 新元素的 type ，重要！！！
  elemToHtml: attachmentToHtml,
}
```

然后注册到 wangEditor ，有两种方式

第一，如果你只想注册 elemToHtml ，没有其他需求，则推荐使用 `registerElemToHtml`

```js
import { Boot } from '@wangeditor/editor'

Boot.registerElemToHtml(elemToHtmlConf)
```

第二，如果你除了注册 elemToHtml 之外，还需要注册其他功能，则推荐使用 `registerModule`

```ts
import { Boot, IModuleConf } from '@wangeditor/editor'

const module: Partial<IModuleConf> = {
  // TS 语法
  // const module = {                      // JS 语法

  // menus: [menu1Conf, menu2Conf, menu3Conf], // 菜单
  // editorPlugin: withBreakAndDelete, // 插件
  // renderElems: [renderElemConf],    // renderElem
  elemsToHtml: [elemToHtmlConf /* 其他元素... */], // elemToHtml

  // 其他功能，下文讲解...
}
Boot.registerModule(module)
```

:::tip

- 必须在创建编辑器之前注册
- 全局只能注册一次，不要重复注册
  :::

此时，你再执行 `editor.getHtml()` 即可得到“附件”元素的 HTML 代码，显示 HTML 时可配合 JS 实现点击下载附件的效果。

### 解析新元素 HTML 到编辑器

通过 `const html = editor.getHtml()` 可以得到正确的 HTML ，但再去设置 HTML `editor.setHtml(html)` 却无效。需要你自定义解析 HTML 的逻辑。

#### 定义 parseElemHtml 函数

```ts
import { IDomEditor, SlateDescendant, SlateElement } from '@wangeditor/editor'

/**
 * 解析 HTML 字符串，生成“附件”元素
 * @param domElem HTML 对应的 DOM Element
 * @param children 子节点
 * @param editor editor 实例
 * @returns “附件”元素，如上文的 myResume
 */
function parseAttachmentHtml(
  domElem: Element,
  children: SlateDescendant[],
  editor: IDomEditor
): SlateElement {
  // TS 语法
  // function parseAttachmentHtml(domElem, children, editor) {                                                     // JS 语法

  // 从 DOM element 中获取“附件”的信息
  const link = domElem.getAttribute('data-link') || ''
  const fileName = domElem.getAttribute('data-fileName') || ''

  // 生成“附件”元素（按照此前约定的数据结构）
  const myResume = {
    type: 'attachment',
    link,
    fileName,
    children: [{ text: '' }], // void node 必须有 children ，其中有一个空字符串，重要！！！
  }

  return myResume
}
```

#### 注册 parseElemHtml 到 wangEditor

先定义 parseHtml 配置

```js
const parseHtmlConf = {
  selector: 'span[data-w-e-type="attachment"]', // CSS 选择器，匹配特定的 HTML 标签
  parseElemHtml: parseAttachmentHtml,
}
```

然后把 `parseHtmlConf` 注册到 wangEditor ，有两种方式：

第一，如果你只想注册一个 parseElemHtml ，没有别的功能，则推荐 `registerParseElemHtml`

```ts
import { Boot } from '@wangeditor/editor'

Boot.registerParseElemHtml(parseHtmlConf)
```

第二，如果你除了想注册 parseElemHtml ，还想注册其他功能，则推荐 `registerModule`

```ts
import { Boot, IModuleConf } from '@wangeditor/editor'

const module: Partial<IModuleConf> = {
  // TS 语法
  // const module = {                      // JS 语法

  // menus: [menu1Conf, menu2Conf, menu3Conf], // 菜单
  // editorPlugin: withBreakAndDelete, // 插件
  // renderElems: [renderElemConf],    // renderElem
  // elemsToHtml: [elemToHtmlConf],    // elemToHtml
  parseElemsHtml: [parseHtmlConf /* 其他元素... */], // parseElemHtml
}
Boot.registerModule(module)
```

:::tip

- 必须在创建编辑器之前注册
- 全局只能注册一次，不要重复注册
  :::

此时，再把获取的 HTML 设置到编辑器中 `editor.setHtml(html)` 即可成功显示“附件”元素。

## 总结

一个模块常用代码文件如下，共选择参考（不一定都用到）

- render-elem.ts
- elem-to-html.ts
- parse-elem-html.ts
- plugin.ts
- menu/
  - Menu1.ts
  - Menu2.ts