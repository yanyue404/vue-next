# vue-next [![npm](https://img.shields.io/npm/v/vue/next.svg)](https://www.npmjs.com/package/vue/v/next) [![build status](https://github.com/vuejs/vue-next/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/vuejs/vue-next/actions/workflows/ci.yml)

This is the repository for Vue 3.0.

## Quickstart

- Via CDN: `<script src="https://unpkg.com/vue@next"></script>`
- In-browser playground on [Codepen](https://codepen.io/yyx990803/pen/OJNoaZL)
- Scaffold via [Vite](https://github.com/vitejs/vite):

  ```bash
  # npm 6.x
  npm init vite@latest my-vue-app --template vue
  # npm 7+, extra double-dash is needed:
  npm init vite@latest my-vue-app -- --template vue
  # yarn
  yarn create vite my-vue-app --template vue
  ```

- Scaffold via [vue-cli](https://cli.vuejs.org/):

  ```bash
  npm install -g @vue/cli # OR yarn global add @vue/cli
  vue create hello-vue3
  # select vue 3 preset
  ```

## 探索

> 从 v3.2.20 开始，Vue 就将其项目的包管理器从 yarn 迁移到了 pnpm

**packages 目录结构**

- reactivity 目录：数据响应式系统，这是一个单独的系统，可以与任何框架配合使用，主要 API 有 ref（数据容器）、reactive（基于 Proxy 实现的响应式数据）、computed（计算数据）、effect（副作用） 等几部分。
- ref-transform 目录： Ref 语法糖
- runtime-core 目录：与平台无关的运行时核心模块。其实现的功能有虚拟 DOM 渲染器、Vue 组件和 Vue 的各种 API，我们可以利用这个 runtime 实现针对某个具体平台的高阶 runtime，比如自定义渲染器 createRenderer。
- runtime-dom 目录: 针对浏览器的 runtime。其功能包括处理原生 DOM API、DOM 事件和 DOM 属性等。它暴露了两个重要 API：render 和 createApp。
- runtime-test 目录: 一个专门为了测试而写的轻量级 runtime。由于这个 rumtime 「渲染」出的 DOM 树其实是一个 JS 对象，所以这个 runtime 可以用在所有 JS 环境里。你可以用它来测试渲染是否正确。它还可以用于序列化 DOM、触发 DOM 事件，以及记录某次更新中的 DOM 操作。
- compiler-core 目录: 平台无关的核心编译器. 它既包含可扩展的基础功能，也包含所有平台无关的插件。
- compiler-dom 目录: 针对浏览器而写的编译器。
- compiler-sfc 目录：Vue 单文件组件（.vue）的编译实现
- compiler-ssr 目录：服务端渲染编译实现
- sfc-playground 目录：单文件组件在线调试工具
- server-renderer 目录: 用于 SSR。
- shared 目录: 主要包含了一些平台无关的 packages 内部帮助方法。
- vue 目录: 用于构建面向公众的「完整构建」版本，引用了上面提到的 runtime 和 compiler。
- global.d.ts TypeScript 声明文件

每个模块下有 **tests** 目录里的测试用例来了解 Vue 3 的所有功能。

关于阅读顺序，我的建议是

1. 先读 reactivity，能最快了解 Vue 3 的新特性；
2. 再读 rumtime，理解组件和生命周期的实现；
3. 如果还有时间再读 compiler，理解编译优化过程。

**源码调试**

1. 使用 `yarn build -s` 命令：（yarn dev -s 也行）

- 可以直接使用 `yarn build -s` 开启 sourcemap 调试 (即 rollup.config.js 开启 sourcemap), 会生成对应的.map 文件
- html 文件中引入生成的 js 文件即可原汁原味的调试

2. 使用 'npm run test 包模块名' 命令：

- 对源代码有不明白的地方，比如 reactivity 模块中 effect.ts 某行代码不懂，可将其注释掉，然后运行 npm run test reactivity,这样有些单测会报错，其实报错的单测就是对注释掉代码的印证，debugger 一下该单测，便能弄明白不懂的源码。
- 除了运行 'npm run test 包模块' 命令,还可以在 vscode 里下载 Jest Runner 插件,然后直接在**test**目录下选中需要运行的单侧文件，打上断点，点击 debugger 小虫子按钮，也能跑单测。

**Vue3 源码解读**

- 阿崔 cxr https://github.com/cuixiaorui/mini-vue（[my fork](https://github.com/yanyue404/mini-vue3)）

**参考文章**

- [Vue 3 源码导读 - 方](https://juejin.cn/post/6844903957421096967)

## Changes from Vue 2

Please consult the [Migration Guide](https://v3.vuejs.org/guide/migration/introduction.html).

Also note: Vue 3 does not support IE11 ([RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0038-vue3-ie11-support.md) | [Discussion](https://github.com/vuejs/rfcs/discussions/296)).

## Supporting Libraries

All of our official libraries and tools now support Vue 3, but most of them are still in beta status and distributed under the `next` dist tag on NPM. **We are planning to stabilize and switch all projects to use the `latest` dist tag in early 2021.**

### Vue CLI

As of v4.5.0, `vue-cli` now provides built-in option to choose Vue 3 preset when creating a new project. You can upgrade `vue-cli` and run `vue create` to create a Vue 3 project today.

### Vue Router

Vue Router 4.0 provides Vue 3 support and has a number of breaking changes of its own. Check out its [Migration Guide](https://next.router.vuejs.org/guide/migration/) for full details.

- [![beta](https://img.shields.io/npm/v/vue-router/next.svg)](https://www.npmjs.com/package/vue-router/v/next)
- [GitHub](https://github.com/vuejs/vue-router-next)
- [RFCs](https://github.com/vuejs/rfcs/pulls?q=is%3Apr+is%3Amerged+label%3Arouter)

### Vuex

Vuex 4.0 provides Vue 3 support with largely the same API as 3.x. The only breaking change is [how the plugin is installed](https://github.com/vuejs/vuex/tree/4.0#breaking-changes).

- [![beta](https://img.shields.io/npm/v/vuex/next.svg)](https://www.npmjs.com/package/vuex/v/next)
- [GitHub](https://github.com/vuejs/vuex/tree/4.0)

### Devtools Extension

We are working on a new version of the Devtools with a new UI and refactored internals to support multiple Vue versions. The new version is currently in beta and only supports Vue 3 (for now). Vuex and Router integration is also work in progress.

- For Chrome: [Install from Chrome web store](https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg?hl=en)

  - Note: the beta channel may conflict with the stable version of devtools so you may need to temporarily disable the stable version for the beta channel to work properly.

- For Firefox: [Download the signed extension](https://github.com/vuejs/vue-devtools/releases/tag/v6.0.0-beta.2) (`.xpi` file under Assets)

### IDE Support

It is recommended to use [VSCode](https://code.visualstudio.com/). There are currently two viable extensions for Single-File Components (SFCs) support:

- [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) (recommended if you are used to Vetur features)
- [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (recommended if using TypeScript with SFCs, or `<script setup>` syntax)

### TypeScript Support

- All Vue 3 packages ship with types.
- [vue-tsc](https://github.com/johnsoncodehk/vue-tsc) perform TypeScript type checks / diagnostics on Vue SFCs via the command line.
- [vue-dts-gen](https://github.com/egoist/vue-dts-gen): generate TypeScript definitions from Vue SFCs.

### Other Projects

| Project               | NPM                             | Repo                 |
| --------------------- | ------------------------------- | -------------------- |
| @vue/babel-plugin-jsx | [![rc][jsx-badge]][jsx-npm]     | [[GitHub][jsx-code]] |
| eslint-plugin-vue     | [![stable][epv-badge]][epv-npm] | [[GitHub][epv-code]] |
| @vue/test-utils       | [![beta][vtu-badge]][vtu-npm]   | [[GitHub][vtu-code]] |
| vue-class-component   | [![beta][vcc-badge]][vcc-npm]   | [[GitHub][vcc-code]] |
| vue-loader            | [![beta][vl-badge]][vl-npm]     | [[GitHub][vl-code]]  |
| rollup-plugin-vue     | [![beta][rpv-badge]][rpv-npm]   | [[GitHub][rpv-code]] |

[jsx-badge]: https://img.shields.io/npm/v/@vue/babel-plugin-jsx.svg
[jsx-npm]: https://www.npmjs.com/package/@vue/babel-plugin-jsx
[jsx-code]: https://github.com/vuejs/jsx-next
[vd-badge]: https://img.shields.io/npm/v/@vue/devtools/beta.svg
[vd-npm]: https://www.npmjs.com/package/@vue/devtools/v/beta
[vd-code]: https://github.com/vuejs/vue-devtools/tree/next
[epv-badge]: https://img.shields.io/npm/v/eslint-plugin-vue.svg
[epv-npm]: https://www.npmjs.com/package/eslint-plugin-vue
[epv-code]: https://github.com/vuejs/eslint-plugin-vue
[vtu-badge]: https://img.shields.io/npm/v/@vue/test-utils/next.svg
[vtu-npm]: https://www.npmjs.com/package/@vue/test-utils/v/next
[vtu-code]: https://github.com/vuejs/vue-test-utils-next
[jsx-badge]: https://img.shields.io/npm/v/@ant-design-vue/babel-plugin-jsx.svg
[jsx-npm]: https://www.npmjs.com/package/@ant-design-vue/babel-plugin-jsx
[jsx-code]: https://github.com/vueComponent/jsx
[vcc-badge]: https://img.shields.io/npm/v/vue-class-component/next.svg
[vcc-npm]: https://www.npmjs.com/package/vue-class-component/v/next
[vcc-code]: https://github.com/vuejs/vue-class-component/tree/next
[vl-badge]: https://img.shields.io/npm/v/vue-loader/next.svg
[vl-npm]: https://www.npmjs.com/package/vue-loader/v/next
[vl-code]: https://github.com/vuejs/vue-loader/tree/next
[rpv-badge]: https://img.shields.io/npm/v/rollup-plugin-vue/next.svg
[rpv-npm]: https://www.npmjs.com/package/rollup-plugin-vue/v/next
[rpv-code]: https://github.com/vuejs/rollup-plugin-vue/tree/next
