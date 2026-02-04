import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SRC_ROOT = path.join(PROJECT_ROOT, "src");
const TOKENS_FILE = path.join(SRC_ROOT, "ui", "tokens.ts");

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
const PX_VALUE_RE = /\b\d+px\b/g;

const scanFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return scanFiles(fullPath);
    }
    return fullPath;
  });
};

const isSourceFile = (filePath: string): boolean => {
  return filePath.endsWith(".ts") || filePath.endsWith(".tsx");
};

describe("UI token enforcement", () => {
  it("avoids hardcoded hex colors and px values outside tokens", () => {
    if (!fs.existsSync(SRC_ROOT)) {
      return;
    }

    const allFiles = scanFiles(SRC_ROOT)
      .filter(isSourceFile)
      .filter((filePath) => filePath !== TOKENS_FILE);

    const violations: string[] = [];

    for (const filePath of allFiles) {
      const contents = fs.readFileSync(filePath, "utf8");
      const hasHex = HEX_COLOR_RE.test(contents);
      const hasPx = PX_VALUE_RE.test(contents);

      HEX_COLOR_RE.lastIndex = 0;
      PX_VALUE_RE.lastIndex = 0;

      if (hasHex || hasPx) {
        const reasons = [
          hasHex ? "hex color" : null,
          hasPx ? "px value" : null,
        ].filter(Boolean);
        violations.push(`${path.relative(PROJECT_ROOT, filePath)} (${reasons.join(", ")})`);
      }
    }

    expect(violations, `Token enforcement violations:\n${violations.join("\n")}`).toEqual([]);
  });
});
