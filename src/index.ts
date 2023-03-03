import {
  BuildOptions,
  createFilter,
  Manifest,
  ManifestChunk,
  mergeConfig,
  normalizePath,
  Plugin,
  UserConfig,
} from 'vite';
import path from 'path';
import fs from 'fs/promises';

export type ScopedBuildOption = {
  entries: Record<string, string>; // e.g. { search : 'src/search.html' }
  manifest?: BuildOptions['manifest'];
  domain?: string;
  hostCSS?: string[];
  mode?: 'shadowRoot' | 'direct';
};

const modeTemplatePath = {
  shadowRoot: './shadow_root_load.template.js',
  direct: './direct_load.template.js',
};

const getBlocksFromManifest = (manifest: Manifest, entry: string) => {
  const conf = manifest[entry];
  const deepGet = <K extends keyof ManifestChunk>(attr: K): string[] =>
    [
      conf[attr] ?? [],
      (conf.imports ?? []).map((im) => manifest[im][attr] ?? []).flat(),
    ].flat() as any;
  const csses = deepGet('css');
  const assets = deepGet('assets');
  return {
    scripts: [
      ...(conf.imports ?? []).map((im) => manifest[im].file),
      conf.file,
    ],
    csses,
    assets,
  };
};

const getNameFromPath = (path: string) => {
  return normalizePath(path).split('/').pop() ?? path;
};

const toVarString = (v: string | string[]): string => {
  if (typeof v === 'string') {
    return `"${v}"`;
  }
  return `[${v.map(toVarString).join(',')}]`;
};

export type TemplateReplacer = {
  name: string;
  domain?: string;
  scripts: string[];
  csses: string[];
  assets: string[];
};
const replaceTemplate = (template: string, replacer: TemplateReplacer) => {
  return template
    .replace("'##NAME##'", toVarString(replacer.name))
    .replace("'##DOMAIN##'", toVarString(replacer.domain ?? ''))
    .replace("'##SCRIPTS##'", toVarString(replacer.scripts))
    .replace("'##CSSES##'", toVarString(replacer.csses))
    .replace("'##ASSETS##'", toVarString(replacer.assets));
};

export const ExposeBuild = (option: ScopedBuildOption): Plugin => {
  const baseCssFileFilter = createFilter('**/*.css');
  const cssFilter = option.hostCSS ? createFilter(option.hostCSS) : () => false;
  return {
    name: 'expose-build',
    apply: 'build',
    enforce: 'pre',
    config: (config) => {
      // set build manifest to be true
      const newConfig = mergeConfig(config, {
        build: {
          manifest: option.manifest ?? true,
          rollupOptions: {
            input: {
              // FIX_ME: 使用更通用的方法统一入口文件
              index: 'index.html',
              ...option.entries,
            },
          },
        },
        define: {
          __EXPOSE_BUILD_PLUGIN_DOMAIN__: option.domain ?? '',
        },
      } as UserConfig);
      return newConfig;
    },

    // replace css
    transform(raw, id, conf) {
      if (option.mode !== 'shadowRoot') return;
      if (!baseCssFileFilter(id)) return;
      if (!cssFilter(id)) return;
      return {
        code: raw.replaceAll(':root', ':host,:root'),
        map: null,
      };
    },

    async writeBundle({ dir }) {
      const manifestPath = path.resolve(
        dir ?? '',
        typeof option.manifest === 'string' ? option.manifest : 'manifest.json'
      );
      const manifest: Manifest = await fs
        .readFile(manifestPath, 'utf-8')
        .then(JSON.parse, () => undefined);
      const template = await fs.readFile(
        path.resolve(__dirname, modeTemplatePath[option.mode ?? 'shadowRoot']),
        'utf-8'
      );
      console.log(manifest)
      await Promise.all(
        Object.entries(option.entries).map(([name, entry]) => {
          const blocks = getBlocksFromManifest(
            manifest,
            getNameFromPath(entry)
          );
          const loadScriptString = replaceTemplate(template, {
            ...blocks,
            name,
            domain: option.domain,
          });
          return fs.writeFile(`${dir}/load_${name}.js`, loadScriptString);
          // FIXME: not working
          // return this.emitFile({
          //   type: 'asset',
          //   fileName: `load_${name}.js`,
          //   source: loadScriptString,
          // });
        })
      );
    },
  };
};
