import js from "@eslint/js";
import security from "eslint-plugin-security";
import globals from "globals";

export default [
  {
    ignores: [
      "bundle.js",
      "node_modules/**"
    ]
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      sourceType: "commonjs"
    },
    plugins: {
      security
    },
    rules: {
      ...security.configs.recommended.rules
    }
  },

  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser
      },
      sourceType: "commonjs"
    }
  }
];