import { createApp } from 'vue';
import './style.css';
import './global-style.css';
import App from './App.vue';

declare global {
  interface Window {
    get_external_root?: () => HTMLElement;
  }
}

const el = window.get_external_root?.();
const root = el?.shadowRoot;
if (root) {
  const div = document.createElement('div');
  createApp(App).mount(div);
  root.appendChild(div);
} else {
  if (el) createApp(App).mount(el);
}

// const el = document.querySelector('#append');
// const root = el?.shadowRoot;
// if (root) {
//   const div = document.createElement('div');
//   createApp(App).mount(div);
//   root.appendChild(div);
// }
