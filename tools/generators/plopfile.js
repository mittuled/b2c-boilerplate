// =============================================================================
// B2C Boilerplate — Plop.js Generators
// =============================================================================
// Usage:  pnpm generate
// =============================================================================

/**
 * @param {import("plop").NodePlopAPI} plop
 */
export default function (plop) {
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  plop.setHelper("curly", (/** @type {string} */ text) => `{${text}}`);

  // ---------------------------------------------------------------------------
  // 1. Component generator
  // ---------------------------------------------------------------------------
  plop.setGenerator("component", {
    description: "Create a reusable React component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name (PascalCase):",
        validate: (v) => (v ? true : "Component name is required"),
      },
      {
        type: "list",
        name: "app",
        message: "Which app?",
        choices: ["web", "admin"],
        default: "web",
      },
      {
        type: "confirm",
        name: "useClient",
        message: "Is this a client component ('use client')?",
        default: false,
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../apps/{{app}}/components/{{kebabCase name}}/{{kebabCase name}}.tsx",
        templateFile: "templates/component/{{kebabCase name}}.tsx.hbs",
      },
      {
        type: "add",
        path: "../../apps/{{app}}/components/{{kebabCase name}}/{{kebabCase name}}.test.ts",
        templateFile: "templates/component/{{kebabCase name}}.test.ts.hbs",
      },
    ],
  });

  // ---------------------------------------------------------------------------
  // 2. Screen / page generator
  // ---------------------------------------------------------------------------
  plop.setGenerator("screen", {
    description: "Create a Next.js page (App Router)",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Route segment name (e.g. dashboard, settings/profile):",
        validate: (v) => (v ? true : "Route name is required"),
      },
      {
        type: "list",
        name: "app",
        message: "Which app?",
        choices: ["web", "admin"],
        default: "web",
      },
      {
        type: "confirm",
        name: "useClient",
        message: "Is this a client page ('use client')?",
        default: false,
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../apps/{{app}}/app/(protected)/{{name}}/page.tsx",
        templateFile: "templates/screen/page.tsx.hbs",
      },
    ],
  });

  // ---------------------------------------------------------------------------
  // 3. Edge Function generator
  // ---------------------------------------------------------------------------
  plop.setGenerator("edge-function", {
    description: "Create a Supabase Edge Function",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Function name (kebab-case):",
        validate: (v) => (v ? true : "Function name is required"),
      },
      {
        type: "list",
        name: "method",
        message: "Primary HTTP method:",
        choices: ["POST", "GET", "PUT", "DELETE"],
        default: "POST",
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../supabase/functions/{{kebabCase name}}/index.ts",
        templateFile: "templates/edge-function/index.ts.hbs",
      },
    ],
  });
}
