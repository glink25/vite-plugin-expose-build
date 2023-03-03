# Expose Build

通过动态挂载组件打包产物，将一个普通的 Vue 组件打包为可以在其他站点中动态引入的组件文件

## DEMO

```bash
npm run build
npm run preview
# 8899为功能站点， 8899/external.html 为测试用外部站点
```

## 使用方法

1. 在`vite.config.ts`中加入插件配置：

```javascript
export default defineConfig({
  plugins: [
    ExposeBuild({
      // 入口文件，必须是一个html文件，可以有多个，名称不能重复；
      // 必须显示地指定index入口，或者在build.rollupOptions.input里指定
      entries: { index:'index.html', outer: 'outer.html' },
      // 打包后js文件所部署在的服务器域名
      domain: 'https://vitejsvitelm67kn-u0kk--8877.local-corp.webcontainer.io',
      // 默认为shadowRoot，否则文件将挂载到body上
      mode: 'shadowRoot'
    }),
  ],
});
```

2. 在项目内新增`outer.html`入口文件（需要暴露几个组件就要创建多少个入口文件），并在其中像普通的 `index.html` 一样，引入对应的加载 js：

```html
<html>
  <head>
    <script type="module" src="/src/xxx.ts"></script>
  </head>
</html>
```

> 注意，入口 html 文件仅用于帮助 Vite 输出 `manifest.json`，所以只需要在这里引入 js 文件，html 文件中的其他信息将被完全忽略

3. `src/xxx.js`中像普通的`main.ts` 一样，引入需要打包成 scoped 的组件，只是需要将 mount 的根组件设置为 shadowRoot 节点。

> Tips: 可以通过全局暴露的 get_outer_root 函数来获取需要挂载的根节点，具体名称由插件配置中的键名决定

```typescript
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

const el = window.get_outer_root?.();;
const root = el?.shadowRoot;
if (root) {
  const div = document.createElement('div');
  createApp(App).mount(div);
  root.appendChild(div);
}
```

4. 打包完成后，输出文件夹中会新增 load_xxx.js 文件，具体名称由插件配置中的键名决定

5. 在需要使用到组件的其他站点页面内，插入代码：

```html
<!-- domain即为静态文件托管地址 -->
<script type="module" src="domain/load_xxx.js"></script>
<body>
  <!-- external.ts内的挂载节点id保持一致 -->
  <div id="append"></div>
  <script>
    // load_xxx.js调用后会在全局作用域暴露xxx_mount的函数，用于手动调用加载js
    window.xxx_mount()
  </script>
</body>
```

这样就可以在其他站点内使用另一站点的打包好的组件了。

## Feature

1. 只有 css 和 script 文件会被引入，图片等资源无法被引入，如果需要使用图片，需要在组件内运行时判断当前域名动态改变引入地址，可以使用插件提供的`useAbsolutePath`帮助函数。需要自行处理部分文件的跨域问题。
2. shadowRoot 模式下，通过 hostCSS 指定的 css 文件内的`:root{}` 选择器会被粗略替换为 `:root,:host{}`。

## Todo
