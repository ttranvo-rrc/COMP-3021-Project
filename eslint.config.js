import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    plugins: {
      security
    },
    rules: {
      ...security.configs.recommended.rules
    }
  }
];