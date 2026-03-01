const almadarPlugin = require("../almadar-eslint");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  // TypeScript + JSX parser
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  // General rules for all TS files
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      almadar: almadarPlugin,
    },
    rules: {
      "almadar/no-as-any": "error",
      "almadar/no-import-generated": "error",
      // Note: strict organism rules disabled for initial development
      // Can enable later: ...almadarPlugin.configs.strict
    },
  },

  // Ignores
  {
    ignores: [
      "dist/**", 
      "node_modules/**",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
  },
];
