import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist/**", "src/generated/**"],
  },
  {
    files: ["src/**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    rules: {
      "no-console": "error",
    },
  },
]);
