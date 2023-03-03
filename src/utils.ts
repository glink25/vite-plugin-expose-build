/**
 * @description replace assets path for exposed componnets
 */
export const useAbsolutePath = (path: string) => {
  if (import.meta.env.DEV) return path;
  const domain: string = '__EXPOSE_BUILD_PLUGIN_DOMAIN__';
  if (domain !== '' && window.origin !== domain) {
    return new URL(path, import.meta.url).href;
  }
  return path;
};
