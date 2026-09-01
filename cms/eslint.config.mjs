import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

const browserGlobals = {
    File: "readonly",
    FormData: "readonly",
    HTMLElement: "readonly",
    HTMLInputElement: "readonly",
    document: "readonly",
    localStorage: "readonly",
};

export default tseslint.config(
    { ignores: ["dist", "node_modules"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx}"],
        languageOptions: { globals: browserGlobals },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "no-restricted-syntax": [
                "error",
                {
                    selector: "FunctionDeclaration",
                    message: "Use a const arrow function instead of a function declaration.",
                },
            ],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "simple-import-sort/imports": ["error", {
                groups: [
                    ["^react(?:\\u0000|/.*|$)"],
                    ["^@?\\w"],
                    ["^@/(?:app|pages|features|ui|domain)(?:/.*|$)"],
                    ["^\\."],
                    ["^@/utils(?:/.*|$)"],
                    ["^.+\\.(?:css|scss|sass|less|styl)\\u0000?$", "^\\u0000"],
                ],
            }],
            "simple-import-sort/exports": "error",
        },
    },
    {
        files: ["src/domain/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: ["@/app/*", "@/pages/*", "@/features/*", "@/ui/*", "@refinedev/*", "axios"],
            }],
        },
    },
    {
        files: ["src/ui/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: ["@/app/*", "@/pages/*", "@/features/*", "@refinedev/*"],
            }],
        },
    },
    {
        files: ["src/features/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: ["@/app/*", "@/pages/*"],
            }],
        },
    },
    {
        files: ["src/pages/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: ["@/app/*"],
            }],
        },
    },
    {
        files: ["src/utils/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: ["@/app/*", "@/pages/*", "@/features/*", "@/ui/*", "@/domain/*"],
            }],
        },
    },
    {
        files: ["src/**/*.test.{ts,tsx}"],
        languageOptions: {
            globals: {
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
            },
        },
    },
);
