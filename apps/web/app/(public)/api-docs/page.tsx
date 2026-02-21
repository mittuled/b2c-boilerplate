import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";

/* ─── Metadata ────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "API Documentation | B2C Boilerplate",
  description:
    "Interactive API reference for the B2C Boilerplate, generated from the OpenAPI specification.",
};

/* ─── Lightweight YAML parser (no external deps) ──────────────────── */

/**
 * A deliberately minimal YAML subset parser that handles the structures
 * present in a typical OpenAPI 3.x spec (mappings, sequences, multiline
 * strings). It is *not* a complete YAML implementation. For a production
 * deployment you would swap this for `js-yaml` or similar, but the task
 * requirement is "no external dependencies".
 */

interface OpenApiSpec {
  info?: { title?: string; version?: string; description?: string };
  tags?: Array<{ name: string; description?: string }>;
  paths?: Record<string, Record<string, PathOperation>>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    securitySchemes?: Record<string, unknown>;
  };
}

interface PathOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  security?: Array<Record<string, string[]>> | never[];
  parameters?: ParameterObject[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: SchemaRef }>;
  };
  responses?: Record<string, ResponseObject>;
}

interface ParameterObject {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: SchemaRef;
}

interface ResponseObject {
  description?: string;
  headers?: Record<string, unknown>;
  content?: Record<string, { schema?: SchemaRef }>;
}

type SchemaRef = SchemaObject | { $ref: string };

interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaRef>;
  items?: SchemaRef;
  required?: string[];
  enum?: string[];
  allOf?: SchemaRef[];
  nullable?: boolean;
  description?: string;
  format?: string;
  example?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

/* ─── YAML loading via js-yaml or raw JSON fallback ────────────────── */

async function loadSpec(): Promise<OpenApiSpec> {
  // Try multiple locations for the OpenAPI spec
  const candidates = [
    join(process.cwd(), "..", "..", "contracts", "openapi.yaml"),
    join(process.cwd(), "contracts", "openapi.yaml"),
    join(process.cwd(), "..", "..", "specs", "001-b2c-foundation", "contracts", "openapi.yaml"),
  ];

  let rawYaml = "";
  for (const candidate of candidates) {
    try {
      rawYaml = await readFile(candidate, "utf-8");
      break;
    } catch {
      // Try next candidate
    }
  }

  if (!rawYaml) {
    // Return a minimal spec so the page still renders
    return {
      info: {
        title: "B2C Boilerplate API",
        version: "1.0.0",
        description: "OpenAPI spec file not found. Run the build from the repository root.",
      },
      tags: [],
      paths: {},
    };
  }

  // Use a simple line-based YAML parser for the structures we need
  return parseYaml(rawYaml) as OpenApiSpec;
}

/* ─── Minimal YAML parser ──────────────────────────────────────────── */

function parseYaml(text: string): unknown {
  const lines = text.split("\n");
  let pos = 0;

  function currentIndent(line: string): number {
    const match = line.match(/^( *)/);
    return match ? match[1].length : 0;
  }

  function parseValue(raw: string): unknown {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === "~" || trimmed === "null") return null;
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
    // Strip quotes
    if (
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  function skipEmpty(): void {
    while (pos < lines.length) {
      const line = lines[pos];
      if (line.trim() === "" || line.trim().startsWith("#")) {
        pos++;
      } else {
        break;
      }
    }
  }

  function parseBlock(minIndent: number): unknown {
    skipEmpty();
    if (pos >= lines.length) return null;

    const line = lines[pos];
    const indent = currentIndent(line);
    if (indent < minIndent) return null;

    const trimmed = line.trim();

    // Sequence
    if (trimmed.startsWith("- ")) {
      return parseSequence(indent);
    }

    // Mapping
    if (trimmed.includes(":")) {
      return parseMapping(indent);
    }

    // Scalar
    pos++;
    return parseValue(trimmed);
  }

  function parseSequence(baseIndent: number): unknown[] {
    const result: unknown[] = [];
    while (pos < lines.length) {
      skipEmpty();
      if (pos >= lines.length) break;
      const line = lines[pos];
      const indent = currentIndent(line);
      if (indent < baseIndent) break;
      if (indent > baseIndent) break;

      const trimmed = line.trim();
      if (!trimmed.startsWith("- ")) break;

      const afterDash = trimmed.slice(2);

      // Inline mapping: - key: value
      if (afterDash.includes(": ")) {
        // Re-write as mapping lines at indent + 2
        const parts = afterDash;
        // Simple inline: parse as one-line mapping
        pos++;
        const obj: Record<string, unknown> = {};
        // Parse the first key:value
        const colonIdx = parts.indexOf(": ");
        if (colonIdx !== -1) {
          const key = parts.slice(0, colonIdx).trim();
          const val = parts.slice(colonIdx + 2).trim();
          obj[key] = parseValue(val);
        }
        // Parse continuation lines at deeper indent
        while (pos < lines.length) {
          skipEmpty();
          if (pos >= lines.length) break;
          const nextLine = lines[pos];
          const nextIndent = currentIndent(nextLine);
          if (nextIndent <= baseIndent) break;
          const nextTrimmed = nextLine.trim();
          if (nextTrimmed.startsWith("- ")) break;
          const cIdx = nextTrimmed.indexOf(": ");
          if (cIdx !== -1) {
            const k = nextTrimmed.slice(0, cIdx).trim();
            const v = nextTrimmed.slice(cIdx + 2).trim();
            if (v === "" || v === ">") {
              pos++;
              obj[k] = parseBlock(nextIndent + 2);
            } else {
              obj[k] = parseValue(v);
              pos++;
            }
          } else {
            pos++;
          }
        }
        result.push(obj);
      } else if (afterDash.includes(":") && !afterDash.includes(": ") && afterDash.endsWith(":")) {
        // - key:\n  nested
        pos++;
        const nestedObj: Record<string, unknown> = {};
        const key = afterDash.slice(0, -1).trim();
        nestedObj[key] = parseBlock(baseIndent + 4);
        result.push(nestedObj);
      } else if (afterDash.trim() === "") {
        // Nested block under sequence item
        pos++;
        result.push(parseBlock(baseIndent + 2));
      } else {
        // Simple scalar
        result.push(parseValue(afterDash));
        pos++;
      }
    }
    return result;
  }

  function parseMapping(baseIndent: number): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    while (pos < lines.length) {
      skipEmpty();
      if (pos >= lines.length) break;
      const line = lines[pos];
      const indent = currentIndent(line);
      if (indent < baseIndent) break;
      if (indent > baseIndent) {
        // This can happen with deeply nested structures; skip
        pos++;
        continue;
      }

      const trimmed = line.trim();
      if (trimmed.startsWith("- ")) break; // sequence at same level

      const colonIdx = trimmed.indexOf(": ");
      const endsWithColon = trimmed.endsWith(":");

      if (colonIdx !== -1) {
        const key = trimmed.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, "");
        const rawVal = trimmed.slice(colonIdx + 2);

        if (rawVal.trim() === ">" || rawVal.trim() === "|") {
          // Multiline string: collect indented lines
          pos++;
          let multiline = "";
          while (pos < lines.length) {
            const ml = lines[pos];
            if (ml.trim() === "" || currentIndent(ml) > indent) {
              multiline += (multiline ? " " : "") + ml.trim();
              pos++;
            } else {
              break;
            }
          }
          result[key] = multiline;
        } else if (rawVal.trim().startsWith("[") && rawVal.trim().endsWith("]")) {
          // Inline array
          const inner = rawVal.trim().slice(1, -1);
          result[key] = inner.split(",").map((s) => parseValue(s.trim()));
          pos++;
        } else if (rawVal.trim().startsWith("{") && rawVal.trim().endsWith("}")) {
          // Inline object
          pos++;
          result[key] = {};
        } else if (rawVal.trim() === "") {
          // Nested block
          pos++;
          result[key] = parseBlock(indent + 2);
        } else if (rawVal.trim().startsWith("$ref")) {
          // $ref special case
          const refMatch = rawVal.match(/['"]([^'"]+)['"]/);
          result[key] = refMatch ? { $ref: refMatch[1] } : parseValue(rawVal);
          pos++;
        } else {
          result[key] = parseValue(rawVal);
          pos++;
        }
      } else if (endsWithColon) {
        const key = trimmed.slice(0, -1).trim().replace(/^['"]|['"]$/g, "");
        pos++;
        result[key] = parseBlock(indent + 2);
      } else {
        // Unexpected line, skip
        pos++;
      }
    }
    return result;
  }

  return parseBlock(0);
}

/* ─── Helper: resolve $ref ─────────────────────────────────────────── */

function resolveRef(ref: string, spec: OpenApiSpec): SchemaObject | null {
  // #/components/schemas/Foo -> components.schemas.Foo
  const parts = ref.replace("#/", "").split("/");
  let current: unknown = spec;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  return current as SchemaObject;
}

function isRef(obj: unknown): obj is { $ref: string } {
  return typeof obj === "object" && obj !== null && "$ref" in obj;
}

function getSchemaName(ref: string): string {
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

/* ─── Render helpers ──────────────────────────────────────────────── */

function methodColor(method: string): string {
  const colors: Record<string, string> = {
    get: "var(--method-get)",
    post: "var(--method-post)",
    put: "var(--method-put)",
    patch: "var(--method-patch)",
    delete: "var(--method-delete)",
  };
  return colors[method] ?? "var(--color-muted)";
}

function renderSchema(
  schema: SchemaRef | undefined,
  spec: OpenApiSpec,
  depth = 0,
): string {
  if (!schema) return "unknown";
  if (isRef(schema)) {
    return getSchemaName(schema.$ref);
  }

  const s = schema as SchemaObject;

  if (s.allOf) {
    const names = s.allOf.map((sub) => {
      if (isRef(sub)) return getSchemaName(sub.$ref);
      if ((sub as SchemaObject).type === "object") return "object";
      return "unknown";
    });
    return names.join(" & ");
  }

  if (s.type === "array" && s.items) {
    return `${renderSchema(s.items, spec, depth)}[]`;
  }

  if (s.type === "object" && s.properties && depth < 2) {
    const fields = Object.entries(s.properties)
      .map(([key, val]) => `${key}: ${renderSchema(val, spec, depth + 1)}`)
      .join(", ");
    return `{ ${fields} }`;
  }

  if (s.enum) {
    return s.enum.map((v) => `"${v}"`).join(" | ");
  }

  return s.type ?? "unknown";
}

/* ─── Endpoint component ──────────────────────────────────────────── */

interface EndpointProps {
  method: string;
  path: string;
  op: PathOperation;
  spec: OpenApiSpec;
}

function Endpoint({ method, path, op, spec }: EndpointProps) {
  const requiresAuth =
    op.security !== undefined &&
    op.security.length > 0 &&
    !op.security.some(
      (s) => typeof s === "object" && Object.keys(s).length === 0,
    );

  const requestBodySchema = op.requestBody?.content?.["application/json"]?.schema;

  return (
    <details className="endpoint" id={op.operationId ?? `${method}-${path}`}>
      <summary className="endpoint-summary">
        <span className="method-badge" style={{ backgroundColor: methodColor(method) }}>
          {method.toUpperCase()}
        </span>
        <code className="endpoint-path">{path}</code>
        {requiresAuth && (
          <span className="auth-badge" title="Requires authentication">
            Auth
          </span>
        )}
        <span className="endpoint-title">{op.summary ?? ""}</span>
      </summary>
      <div className="endpoint-body">
        {op.description && (
          <p className="endpoint-description">{op.description}</p>
        )}

        {/* Parameters */}
        {op.parameters && op.parameters.length > 0 && (
          <div className="section">
            <h4>Parameters</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>In</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {op.parameters.map((param) => (
                  <tr key={`${param.in}-${param.name}`}>
                    <td>
                      <code>{param.name}</code>
                    </td>
                    <td>{param.in}</td>
                    <td>
                      <code>
                        {param.schema
                          ? renderSchema(param.schema, spec)
                          : "string"}
                      </code>
                    </td>
                    <td>{param.required ? "Yes" : "No"}</td>
                    <td>{param.description ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Request Body */}
        {requestBodySchema && (
          <div className="section">
            <h4>Request Body</h4>
            <code className="schema-type">
              {renderSchema(requestBodySchema, spec)}
            </code>
            {isRef(requestBodySchema) && (
              <SchemaDetail
                name={getSchemaName(requestBodySchema.$ref)}
                schema={resolveRef(requestBodySchema.$ref, spec)}
                spec={spec}
              />
            )}
          </div>
        )}

        {/* Responses */}
        {op.responses && (
          <div className="section">
            <h4>Responses</h4>
            <div className="responses-list">
              {Object.entries(op.responses).map(([code, resp]) => {
                const r = resp as ResponseObject;
                const respSchema = r?.content?.["application/json"]?.schema;
                return (
                  <div key={code} className="response-item">
                    <span
                      className="status-code"
                      data-success={code.startsWith("2")}
                      data-redirect={code.startsWith("3")}
                      data-client-error={code.startsWith("4")}
                      data-server-error={code.startsWith("5")}
                    >
                      {code}
                    </span>
                    <span className="response-desc">
                      {r?.description ?? ""}
                    </span>
                    {respSchema && (
                      <code className="schema-type">
                        {renderSchema(respSchema, spec)}
                      </code>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

/* ─── Schema detail component ─────────────────────────────────────── */

function SchemaDetail({
  name,
  schema,
  spec,
}: {
  name: string;
  schema: SchemaObject | null;
  spec: OpenApiSpec;
}) {
  if (!schema || !schema.properties) return null;

  return (
    <div className="schema-detail">
      <table className="params-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(schema.properties).map(([field, fieldSchema]) => {
            const required = schema.required?.includes(field) ?? false;
            return (
              <tr key={field}>
                <td>
                  <code>{field}</code>
                </td>
                <td>
                  <code>{renderSchema(fieldSchema, spec)}</code>
                </td>
                <td>{required ? "Yes" : "No"}</td>
                <td>
                  {!isRef(fieldSchema)
                    ? (fieldSchema as SchemaObject).description ?? ""
                    : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default async function ApiDocsPage() {
  const spec = await loadSpec();
  const info = spec.info ?? {};
  const tags = spec.tags ?? [];
  const paths = spec.paths ?? {};

  // Group endpoints by tag
  const grouped: Record<
    string,
    { method: string; path: string; op: PathOperation }[]
  > = {};

  for (const tag of tags) {
    grouped[tag.name] = [];
  }
  // Fallback group for untagged endpoints
  grouped["Other"] = [];

  for (const [path, methods] of Object.entries(paths)) {
    if (!methods || typeof methods !== "object") continue;
    for (const [method, op] of Object.entries(methods)) {
      if (typeof op !== "object" || op === null) continue;
      const operation = op as PathOperation;
      const tag = operation.tags?.[0] ?? "Other";
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push({ method, path, op: operation });
    }
  }

  // Collect schemas for reference section
  const schemas = spec.components?.schemas ?? {};

  return (
    <>
      <style>{`
        :root {
          --color-bg: #ffffff;
          --color-surface: #f8f9fa;
          --color-border: #dee2e6;
          --color-text: #212529;
          --color-text-muted: #6c757d;
          --color-primary: #2563eb;
          --color-primary-light: #dbeafe;
          --method-get: #22c55e;
          --method-post: #3b82f6;
          --method-put: #f59e0b;
          --method-patch: #a855f7;
          --method-delete: #ef4444;
          --radius: 6px;
          --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --color-bg: #111827;
            --color-surface: #1f2937;
            --color-border: #374151;
            --color-text: #f3f4f6;
            --color-text-muted: #9ca3af;
            --color-primary: #60a5fa;
            --color-primary-light: #1e3a5f;
          }
        }

        .api-docs {
          max-width: 960px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          color: var(--color-text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
        }

        .api-docs h1 {
          font-size: 2rem;
          margin-bottom: 0.25rem;
        }

        .api-docs .version {
          display: inline-block;
          background: var(--color-primary-light);
          color: var(--color-primary);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .api-docs .description {
          color: var(--color-text-muted);
          margin-bottom: 2rem;
          max-width: 640px;
        }

        /* Navigation */
        .api-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .api-nav a {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius);
          background: var(--color-surface);
          color: var(--color-text);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid var(--color-border);
          transition: background 0.15s;
        }

        .api-nav a:hover,
        .api-nav a:focus-visible {
          background: var(--color-primary-light);
          color: var(--color-primary);
          outline: 2px solid var(--color-primary);
          outline-offset: 1px;
        }

        /* Tag sections */
        .tag-section {
          margin-bottom: 2.5rem;
        }

        .tag-section h2 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
          scroll-margin-top: 1rem;
        }

        .tag-description {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        /* Endpoint */
        .endpoint {
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          margin-bottom: 0.75rem;
          background: var(--color-bg);
          overflow: hidden;
        }

        .endpoint[open] {
          border-color: var(--color-primary);
        }

        .endpoint-summary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          user-select: none;
          list-style: none;
          flex-wrap: wrap;
        }

        .endpoint-summary::-webkit-details-marker {
          display: none;
        }

        .endpoint-summary:hover {
          background: var(--color-surface);
        }

        .endpoint-summary:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: -2px;
        }

        .method-badge {
          display: inline-block;
          min-width: 4.5rem;
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .endpoint-path {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .auth-badge {
          display: inline-block;
          padding: 0.0625rem 0.375rem;
          border-radius: var(--radius);
          background: #fef3c7;
          color: #92400e;
          font-size: 0.6875rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .auth-badge {
            background: #451a03;
            color: #fbbf24;
          }
        }

        .endpoint-title {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .endpoint-body {
          padding: 1rem;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .endpoint-description {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin-bottom: 1rem;
          max-width: 640px;
        }

        /* Sections within endpoint */
        .section {
          margin-bottom: 1rem;
        }

        .section h4 {
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
        }

        /* Parameters table */
        .params-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .params-table th,
        .params-table td {
          text-align: left;
          padding: 0.375rem 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }

        .params-table th {
          color: var(--color-text-muted);
          font-weight: 600;
          background: var(--color-bg);
        }

        .params-table code {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          background: var(--color-bg);
          padding: 0.125rem 0.25rem;
          border-radius: 3px;
        }

        /* Responses */
        .responses-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .response-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          flex-wrap: wrap;
        }

        .status-code {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.8125rem;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
        }

        .status-code[data-success="true"] {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }

        .status-code[data-client-error="true"] {
          background: #fef3c7;
          color: #92400e;
          border-color: #fde68a;
        }

        .status-code[data-server-error="true"] {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }

        @media (prefers-color-scheme: dark) {
          .status-code[data-success="true"] {
            background: #052e16;
            color: #86efac;
            border-color: #166534;
          }
          .status-code[data-client-error="true"] {
            background: #451a03;
            color: #fde68a;
            border-color: #92400e;
          }
          .status-code[data-server-error="true"] {
            background: #450a0a;
            color: #fca5a5;
            border-color: #991b1b;
          }
        }

        .response-desc {
          color: var(--color-text-muted);
        }

        .schema-type {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--color-primary);
        }

        .schema-detail {
          margin-top: 0.5rem;
        }

        /* Schemas reference section */
        .schemas-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .schemas-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .schema-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .schema-card summary {
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-weight: 600;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          user-select: none;
          list-style: none;
        }

        .schema-card summary::-webkit-details-marker {
          display: none;
        }

        .schema-card summary:hover {
          background: var(--color-surface);
        }

        .schema-card summary:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: -2px;
        }

        .schema-card-body {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        @media (max-width: 640px) {
          .api-docs { padding: 1rem; }
          .endpoint-summary { gap: 0.5rem; }
          .params-table { font-size: 0.75rem; }
          .params-table th, .params-table td { padding: 0.25rem 0.5rem; }
        }
      `}</style>

      <main className="api-docs" role="main">
        <h1>{info.title ?? "API Documentation"}</h1>
        {info.version && <span className="version">v{info.version}</span>}
        {info.description && <p className="description">{info.description}</p>}

        {/* Tag navigation */}
        <nav className="api-nav" aria-label="API sections">
          {tags
            .filter((t) => grouped[t.name]?.length > 0)
            .map((t) => (
              <a key={t.name} href={`#section-${t.name}`}>
                {t.name} ({grouped[t.name].length})
              </a>
            ))}
          <a href="#schemas-ref">Schemas</a>
        </nav>

        {/* Endpoint groups */}
        {tags
          .filter((t) => grouped[t.name]?.length > 0)
          .map((tag) => (
            <section
              key={tag.name}
              className="tag-section"
              id={`section-${tag.name}`}
              aria-labelledby={`heading-${tag.name}`}
            >
              <h2 id={`heading-${tag.name}`}>{tag.name}</h2>
              {tag.description && (
                <p className="tag-description">{tag.description}</p>
              )}
              {grouped[tag.name].map(({ method, path, op }) => (
                <Endpoint
                  key={`${method}-${path}`}
                  method={method}
                  path={path}
                  op={op}
                  spec={spec}
                />
              ))}
            </section>
          ))}

        {/* Untagged endpoints */}
        {grouped["Other"]?.length > 0 && (
          <section className="tag-section" id="section-Other">
            <h2>Other</h2>
            {grouped["Other"].map(({ method, path, op }) => (
              <Endpoint
                key={`${method}-${path}`}
                method={method}
                path={path}
                op={op}
                spec={spec}
              />
            ))}
          </section>
        )}

        {/* Schemas reference */}
        <section className="schemas-section" id="schemas-ref" aria-labelledby="heading-schemas">
          <h2 id="heading-schemas">Schemas</h2>
          {Object.entries(schemas).map(([name, schema]) => {
            const s = schema as SchemaObject;
            return (
              <details key={name} className="schema-card">
                <summary>{name}</summary>
                <div className="schema-card-body">
                  {s.description && (
                    <p className="endpoint-description">{s.description}</p>
                  )}
                  {s.properties && (
                    <table className="params-table">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Type</th>
                          <th>Required</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(s.properties).map(([field, fieldSchema]) => {
                          const fs = fieldSchema as SchemaObject;
                          const required = s.required?.includes(field) ?? false;
                          return (
                            <tr key={field}>
                              <td>
                                <code>{field}</code>
                              </td>
                              <td>
                                <code>{renderSchema(fieldSchema, spec)}</code>
                              </td>
                              <td>{required ? "Yes" : "No"}</td>
                              <td>{!isRef(fieldSchema) ? (fs.description ?? "") : ""}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  {s.enum && (
                    <p>
                      <strong>Values: </strong>
                      <code>{s.enum.join(", ")}</code>
                    </p>
                  )}
                </div>
              </details>
            );
          })}
        </section>
      </main>
    </>
  );
}
