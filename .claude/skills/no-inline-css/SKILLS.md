# Inline CSS Skill

## CSS Styling Rules

### Inline Styles Are Acceptable

Inline `style` props in React/JSX components are acceptable and often preferred for:

- **One-off styles** - Unique styles that won't be reused
- **Dynamic styles** - Styles that depend on props or state
- **Responsive tweaks** - Quick responsive adjustments
- **Component-specific layout** - Flex, positioning, sizing

**✅ This is fine:**

```jsx
<Paper style={{ background: 'linear-gradient(...)' }}>
<Box style={{ flex: 1, minWidth: 280 }}>
<Text style={{ wordBreak: 'break-word' }}>
```

### When to Use CSS Files Instead

Consider CSS modules/files when:

1. **Repeated styles** - Same style used in 3+ places
2. **Complex selectors** - Pseudo-classes, media queries, animations
3. **Theme-level styles** - Colors, typography, spacing tokens

### Mantine-Specific Notes

- Use Mantine's built-in props first (`p`, `m`, `c`, `fz`, etc.)
- Inline styles work great for Mantine components
- For Mantine internal elements, may need CSS with `.mantine-*` classes
