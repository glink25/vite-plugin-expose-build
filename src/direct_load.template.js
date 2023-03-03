const MOUNT_JS_NAME = '##NAME##';
const ORIGIN_DOMIN = '##DOMAIN##';

const CssFiles = '##CSSES##';
const AssetsFiles = '##ASSETS##';
const JsFiles = '##SCRIPTS##';

let __exposedPluginEl;

const mount = (el) => {
  const root = document.body;
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
