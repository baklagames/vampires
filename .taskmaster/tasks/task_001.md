# Task ID: 1

**Title:** YAML Config Loader and Validation System

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Implement the core configuration system to load, validate, and provide immutable runtime access to game balance parameters.

**Details:**

Create `src/config/loader.ts` and `src/config/schema.ts`. Use a library like `js-yaml` to parse the YAML file and `zod` or `ajv` for schema validation. Ensure the config object is deeply frozen (`Object.freeze`) once loaded to maintain immutability. Parameters include player name rules, NPC density, cycle timers, and bite ranges. 

```typescript
// Pseudo-code snippet
export const loadConfig = async (path: string) => {
  const raw = await fetch(path).then(res => res.text());
  const data = yaml.load(raw);
  const validated = ConfigSchema.parse(data);
  return Object.freeze(validated);
};
```

**Test Strategy:**

Unit tests to verify: 1. Successful loading of valid YAML. 2. Validation errors for missing/invalid fields. 3. Proper application of default values. 4. Immutability of the returned object.
