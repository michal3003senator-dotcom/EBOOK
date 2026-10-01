import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: ["src/generated/**", ".next/**"] },
  // Reguła dotyczy Pages Routera; tu <a> prowadzi do plików CSV z route handlerów.
  { rules: { "@next/next/no-html-link-for-pages": "off" } },
];
export default config;
