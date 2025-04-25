import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",  // `any` kullanımına izin ver
      "@typescript-eslint/no-unused-vars": "off",  // Kullanılmayan değişkenlere uyarı vermez
      "react-hooks/exhaustive-deps": "off", // React hook bağımlılıklarını kontrol etmeyi devre dışı bırak
      "@next/next/no-html-link-for-pages": "off", // `<a>` elementleri için uyarıları devre dışı bırak
    },
  },
];

export default eslintConfig;
