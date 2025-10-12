// sanitizeV5.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";
import mongoSanitizeDefault from "express-mongo-sanitize";

/**
 * The express-mongo-sanitize package exports a function (the middleware),
 * and at runtime it also exposes .sanitize(obj, options) and .has(obj, allowDots).
 * The published TypeScript types don't include those utilities, so we declare
 * a narrow runtime shape and cast the default export to it.
 */
type SanitizeOptions = {
  /**
   * Replace illegal characters or prefixes with a string.
   * If omitted, the sanitizer removes the key.
   */
  replaceWith?: string;
  /**
   * If true, allow dot notation (e.g., "a.b") in keys.
   * Default is false.
   */
  allowDots?: boolean;
  /**
   * Optional callback invoked when a value requiring sanitization is detected.
   */
  onSanitize?: (args: { req: Request; key: "body" | "params" | "query" }) => void;
};

type MongoSanitizeRuntime = {
  sanitize<T>(obj: T, options?: SanitizeOptions): T;
  has(obj: unknown, allowDots?: boolean): boolean;
};

const mongoSanitize = mongoSanitizeDefault as unknown as
  ((options?: SanitizeOptions) => RequestHandler) & MongoSanitizeRuntime;

/**
 * Deep copy helper that preserves types.
 * - Primitives are returned as-is
 * - Arrays are mapped recursively
 * - Plain objects are cloned via Object.entries
 */
function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (obj.map((item) => deepCopy(item)) as unknown) as T;
  }
  // Clone plain object
  const entries = Object.entries(obj as Record<string, unknown>).map(
    ([k, v]) => [k, deepCopy(v)]
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (Object.fromEntries(entries) as unknown) as T;
}

/**
 * Express 5–friendly sanitizer:
 * - Sanitizes req.body and req.params in-place (writable).
 * - For req.query (read-only getter in Express 5), replaces the property with
 *   a sanitized, concrete value using Object.defineProperty.
 * - Skips req.headers: request headers are effectively read-only and should not be reassigned.
 */
export default function sanitizeV5(options: SanitizeOptions = {}): RequestHandler {
  const hasOnSanitize = typeof options.onSanitize === "function";

  return function (req: Request, _res: Response, next: NextFunction) {
    // 1) Sanitize writable fields: body and params
    (["body", "params"] as const).forEach((key) => {
      const current = req[key];
      if (current != null) {
        const clean = mongoSanitize.sanitize(current, options);
        // Assign back (these properties are writable in Express)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        (req as any)[key] = clean;

        if (hasOnSanitize && mongoSanitize.has(clean, options.allowDots)) {
          options.onSanitize?.({ req, key });
        }
      }
    });

    // 2) Special handling for read-only getter: req.query (Express v5)
    if (req.query != null) {
      // Clone first so we never mutate the underlying getter-backed object
      const cleanQuery = mongoSanitize.sanitize(deepCopy(req.query), options);

      // Replace the property entirely with a concrete sanitized value
      Object.defineProperty(req as any, "query", {
        value: cleanQuery,
        writable: false,
        configurable: true,
        enumerable: true,
      });

      if (hasOnSanitize && mongoSanitize.has(cleanQuery, options.allowDots)) {
        options.onSanitize?.({ req, key: "query" });
      }
    }

    next();
  };
}
