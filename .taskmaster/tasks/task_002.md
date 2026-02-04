# Task ID: 2

**Title:** Design System Tokens and Color Roles

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Establish the foundational UI tokens and color roles for consistent styling across all screens and components.

**Details:**

Implement `src/ui/tokens.ts` defining spacing, typography, radii, and color palettes (e.g., semantic roles like 'danger', 'stealth-active', 'sun-warning'). These tokens must be used by all subsequent UI components. 

```typescript
export const TOKENS = {
  colors: { primary: '#6200ee', sunDamage: '#ffeb3b', panic: '#f44336' },
  spacing: { sm: 4, md: 8, lg: 16 },
  radius: { default: 4 }
};
```

**Test Strategy:**

Visual verification that CSS variables or JS constants match the design specs. Automated linting check to ensure no hardcoded hex colors are used in UI files.
