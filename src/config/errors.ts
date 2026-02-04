import { z } from "zod";

const formatIssuePath = (
  path: Array<string | number | symbol>,
): string => {
  if (path.length === 0) {
    return "<root>";
  }

  return path
    .map((segment) => {
      if (typeof segment === "number") {
        return `[${segment}]`;
      }
      if (typeof segment === "symbol") {
        return segment.toString();
      }
      return segment;
    })
    .join(".");
};

export const formatZodError = (error: z.ZodError): string => {
  const lines = error.issues.map((issue) => {
    const path = formatIssuePath(issue.path);
    return `- ${path}: ${issue.message}`;
  });

  return ["Invalid config:", ...lines].join("\n");
};
