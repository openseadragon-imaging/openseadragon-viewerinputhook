import { defineConfig, Plugin } from 'vite';
//import { replacePlugin } from 'rolldown/plugins';
import dtsPlugin from 'vite-plugin-dts';
import { execSync } from 'node:child_process';

const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
//const gitNumCommits = Number(execSync('git rev-list HEAD --count').toString().trim());
const gitDirty = execSync('git status -s -uall').toString().trim().length > 0;

const bannerText = `/* ${process.env.npm_package_name} ${process.env.npm_package_version} ${gitHash} (${gitDirty ? 'dirty' : 'clean'})  @license MIT */`;

const packageVersion = process.env.npm_package_version || '0.0.0';
const versionSplits = packageVersion.split('.');
const versionObj = {
  versionStr: packageVersion,
  major: parseInt(versionSplits[0], 10),
  minor: parseInt(versionSplits[1], 10),
  revision: parseInt(versionSplits[2], 10),
};

// Custom find-and-replace plugin
function findAndReplacePlugin(
  replacements: { find: RegExp; replace: string }[],
): Plugin {
  return {
    name: 'find-and-replace-plugin',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.(ts|js|tsx|jsx)$/.test(id)) return code;

      let newCode = code;
      for (const { find, replace } of replacements) {
        newCode = newCode.replace(find, replace);
      }
      return newCode;
    },
  };
}

export default defineConfig({
  define: {
    // __PKG_VERSION_OBJ__: JSON.stringify(versionObj),
  },
  build: {
    sourcemap: true,
    minify: true, //'oxc', //false
    outDir: 'dist',
    lib: {
      entry: 'src/viewerinputhook.ts',
      name: 'ViewerInputHook',
      fileName: (format: string) => {
        if (format === 'es') {
          return `openseadragon-viewerinputhook.js`;
        } else {
          return `openseadragon-viewerinputhook.${format}.js`;
        }
      },
      formats: ['es', 'umd'],
    },
    rolldownOptions: {
      input: {
        'openseadragon-viewerinputhook': 'src/openseadragon-viewerinputhook.ts',
      },
      output: {
        globals: {
          openseadragon: 'OpenSeadragon',
        },
        postBanner: bannerText,
      },
      external: ['openseadragon'],
      plugins: [
        // replacePlugin(
        //   {
        //     __PKG_VERSION__: process.env.npm_package_version || '0.0.0',
        //     __PKG_VERSION_STR__: `'${process.env.npm_package_version || '0.0.0'}'`,
        //     __PKG_VERSION_OBJ__: JSON.stringify(versionObj),
        //   },
        //   {
        //     // delimiters: ["\\b", "\\b(?!\\.)"],
        //   },
        // ),
      ],
    },
  },
  plugins: [
    findAndReplacePlugin([
      // Replace inside comments and code
      // { find: /\/\/\s*TODO:/g, replace: '// DONE:' },
      // { find: /\bconsole\.log\b/g, replace: 'console.debug' },
      { find: /__PKG_VERSION_OBJ__/g, replace: JSON.stringify(versionObj) },
      {
        find: /__PKG_VERSION_STR__/g,
        replace: `'${process.env.npm_package_version || '0.0.0'}'`,
      },
      {
        find: /__PKG_VERSION__/g,
        replace: process.env.npm_package_version || '0.0.0',
      },
    ]),
    dtsPlugin({
      tsconfigPath: './tsconfig.dts.json',
      // insertTypesEntry: true,
      // copyDtsFiles: true,
    }),
  ],
});
