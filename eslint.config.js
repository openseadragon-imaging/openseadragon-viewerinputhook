import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
//import json from "@eslint/json";
//import markdown from "@eslint/markdown";
//import css from "@eslint/css";

export default defineConfig([
  {
    // Global Ignores
    ignores: [
      // ESLint default ["**/node_modules/", ".git/"]
      'dist/**',
      'docs/**',
    ],
  },
  {
    name: 'js/ts',
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    ignores: [],
    plugins: { js, tseslint },
    extends: [
      js.configs.recommended,
      // see https://typescript-eslint.io/users/configs for more tseslint configs
      //tseslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn', //"error" "off" ("warn" is default)
      reportUnusedInlineConfigs: 'warn', //"error" "off" ("warn" is default)
    },
    rules: {
      'no-unused-vars': 'warn',
      // // Use the following for tseslint plugin recommended-type-checked and strict-type-checked rulesets
      // '@typescript-eslint/only-throw-error': [
      //   'error',
      //   {
      //     allow: [
      //       {
      //         from: 'package',
      //         package: '@tanstack/router-core',
      //         name: 'Redirect',
      //       },
      //       {
      //         from: 'package',
      //         package: '@tanstack/router-core',
      //         name: 'NotFoundError',
      //       },
      //     ],
      //   },
      // ],
    },
  },
  //{ files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  //{ files: ["**/*.jsonc"], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"] },
  //{ files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
  //{ files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
]);
