import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  minify: true,
  banner: { js: '#!/usr/bin/env node' },
  sourcemap: false,
  dts: false,
  splitting: false,
  treeshake: true,
  shims: false,
});
