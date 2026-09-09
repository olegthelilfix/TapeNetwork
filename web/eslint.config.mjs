import { FlatCompat } from "@eslint/eslintrc";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

const config = [
    {
        ignores: [".next/**", "node_modules/**", "src/api/**"],
    },
    ...compat.extends("next/core-web-vitals"),
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        ["^react"],
                        ["^(?!@/)(?!\\.).+"],
                        ["^@/(?:api|app|features|ui|services|domain)(?:/|\\u0000|$)"],
                        ["^\\.(?!.*\\.css\\u0000?$)"],
                        ["^@/utils(?:/|\\u0000|$)"],
                        ["^.+\\.css\\u0000?$"],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
        },
    },
];

export default config;
