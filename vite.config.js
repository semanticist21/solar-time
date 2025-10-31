// vite.config.ts

import path from "node:path";
import typescript from "@rollup/plugin-typescript";
import {typescriptPaths} from "rollup-plugin-typescript-paths";
import {defineConfig} from "vitest/config";

const __dirname = path.resolve();

export default defineConfig({
  plugins: [typescript()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
  test: {
    globals: true,
    environment: "node",
  },
  build: {
    manifest: true,
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [],
      plugins: [
        typescriptPaths({
          preserveExtensions: true,
        }),
        typescript({
          sourceMap: false,
          declaration: true,
          outDir: "dist",
        }),
      ],
    },
  },
});
