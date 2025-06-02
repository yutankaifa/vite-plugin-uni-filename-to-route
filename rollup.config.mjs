import typescript from "@rollup/plugin-typescript";

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: "src/index.ts",
  output: [
    {
      format: "commonjs",
      file: "dist/index.cjs",
    },
    {
      format: "esm",
      file: "dist/index.mjs",
    },
  ],
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
};
