# No Inline CSS Skill

## CSS Styling Rules

### No Inline Styles

Never use inline `style` props in React/JSX components. All styles must be defined in CSS files.

**❌ Do NOT do this:**

```jsx
<Paper style={{ background: 'linear-gradient(...)' }}>
<Box style={{ flex: 1, minWidth: 280 }}>
```

**✅ Do this instead:**

```jsx
<Paper className="gradient-paper">
<Box className="flex-box">
```

Then define in CSS:

```css
.gradient-paper {
  background: linear-gradient(...);
}
.flex-box {
  flex: 1;
  min-width: 280px;
}
```

### Why This Matters

1. **Maintainability** - Styles in one place are easier to update
2. **Reusability** - CSS classes can be reused across components
3. **Performance** - CSS classes are more performant than inline styles
4. **Consistency** - Enforces design system adherence
5. **Overrides** - Mantine components may need `!important` in CSS for reliable styling

### Mantine-Specific Notes

- Use Mantine's `className` prop for custom styles
- For Mantine internal elements, target `.mantine-*` classes in CSS
- May need `!important` to override Mantine's default styles
