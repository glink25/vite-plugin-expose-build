const MOUNT_JS_NAME = "external";
const ORIGIN_DOMIN = "http://localhost:8877";

const CssFiles = ["assets/App-9c6a6328.css"];
const AssetsFiles = ["assets/vue-5532db34.svg"];
const JsFiles = ["assets/App-96d5b71d.js","assets/external-4de56d1b.js"];

let __exposedPluginEl;

const mount = (el) => {
  const root = el.attachShadow({ mode: 'open' });
  const styles = CssFiles.map((href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${ORIGIN_DOMIN}/${href}`;
    return link;
  });
  const scripts = JsFiles.map((src) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.crossOrigin = true;
    script.src = `${ORIGIN_DOMIN}/${src}`;
    return script;
  });
  [...styles, ...scripts].forEach((block) => {
    root.appendChild(block);
  });
  __exposedPluginEl = el;
};

window[`${MOUNT_JS_NAME}_mount`] = mount;
window[`get_${MOUNT_JS_NAME}_root`] = () => __exposedPluginEl;
