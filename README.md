# vite-plugin-uni-filename-to-route

> 小程序基于文件名快速生成路由的 Vite 插件

## 简介

`vite-plugin-uni-filename-to-route` 是一个用于 uni-app 项目的 Vite 插件，能够根据 `src/pages` 和 `src/package*/pages` 目录下的 `.vue` 文件自动生成和维护 `pages.json` 路由配置。支持页面的自动添加、删除和分包结构，极大提升多页面小程序项目的开发效率。

## 特性

- 自动扫描 `src/pages` 和 `src/package*/pages` 目录下的 `.vue` 文件
- 新增页面自动写入 `pages.json`，无需手动维护
- 删除页面自动同步移除对应路由
- 支持分包（subPackages）结构
- 零配置开箱即用

## 安装

```bash
pnpm add vite-plugin-uni-filename-to-route -D
# 或
npm install vite-plugin-uni-filename-to-route --save-dev
```

## 使用方法

在你的 `vite.config.ts` 中引入并注册插件：

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import uniFileToRoute from "vite-plugin-uni-filename-to-route";
import path from "path";

export default defineConfig({
  plugins: [uniFileToRoute(), uni()],
});
```

## 路由生成规则

- 普通页面：`src/pages/xxx/yyy.vue` → `pages/xxx/yyy`
- 分包页面：`src/packageA/pages/xxx.vue` → 分包名 `packageA`，路由 `pages/xxx`
- 插件会自动维护 `pages.json` 的 `pages` 和 `subPackages` 字段

## pages.json 示例

```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationStyle": "custom" } },
    { "path": "pages/my/index", "style": { "navigationStyle": "custom" } }
  ],
  "subPackages": [
    {
      "name": "packageA",
      "root": "packageA",
      "pages": [{ "path": "pages/index" }]
    }
  ]
}
```

## 原理简介

- 插件在开发模式下监听 `src/pages` 和 `src/package*/pages` 目录下的 `.vue` 文件变化（新增/删除），自动同步到 `pages.json`。
- 新增页面文件时自动添加路由，删除页面文件时自动移除路由。
- 支持分包结构，分包下最后一个页面被删除时自动移除整个分包。

## License

ISC
