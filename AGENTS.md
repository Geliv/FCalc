# FCalc Agent 说明

## 项目结构

- 本仓库是一个静态 PWA 计算器项目。仓库内没有配置包管理器、构建步骤、打包器、CI、linter 或 formatter。
- `index.html` 只负责跳转到 `MyCalc.html`；主应用 UI、样式和浏览器端 JavaScript 都在 `MyCalc.html`。
- `sw.js` 是 Service Worker，负责预缓存应用壳，并对 GET 响应做运行时缓存。
- `manifest.webmanifest` 定义 PWA 元数据、图标、显示模式、主题色和启动地址。
- `vendor/` 存放本地 vendored 浏览器依赖，包括 Tailwind runtime script、jQuery、MathQuill 和 Math.js。优先使用这些本地文件，不要随意新增 CDN 依赖。
- `icons/` 存放 manifest 和 HTML 引用的 PWA 图标资源。

## 常用命令

- 测试浏览器行为时，从仓库根目录启动本地静态服务器：

  ```sh
  python3 -m http.server 8000
  ```

- 打开 `http://localhost:8000/` 或 `http://localhost:8000/MyCalc.html`。优先使用 HTTP 而不是 `file://`，因为 Service Worker 和 PWA 行为需要 localhost 这类浏览器安全上下文。
- 当前仓库没有定义 install、build、test、lint 或 format 命令。

## 开发规则

- 保持改动最小，并保留当前静态、无依赖安装的工作流，除非用户明确要求引入工具链。
- 修改可能被 Service Worker 缓存的资源时，更新 `sw.js` 里的 `CACHE_NAME`，避免已部署客户端继续命中旧缓存。
- 如果 `manifest.webmanifest` 的改动需要缓存失效，同时更新 `MyCalc.html` 和 `sw.js` 中的 manifest 查询参数。
- 保持 `sw.js` 里的应用壳路径与仓库中的真实文件一致。
- 除非任务明确涉及 vendored 依赖，否则不要直接编辑 `vendor/` 里的 minified 文件。
- 删除 PWA 图标文件或 manifest 条目前，先检查 `MyCalc.html`、`manifest.webmanifest` 和 `sw.js` 中的所有引用。

## 验证方式

- 前端或 PWA 改动后，通过本地 HTTP 服务器测试；如果缓存表现异常，先硬刷新或注销旧 Service Worker。
- UI 改动后，在桌面宽度和移动端宽度下检查主计算器页面。
- Service Worker 改动后，先确认应用在线状态下仍能正常加载，再测试离线行为。
