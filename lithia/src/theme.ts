import { createTheme, type MantineColorsTuple } from '@mantine/core';

// UO Brand Colors — https://communications.uoregon.edu/uo-brand/visual-identity/colors
// Primary: UO Green #007030 | UO Yellow #FEE11A
// Secondary: Legacy Green #104735 | Grass Green #489D46 | Lime Green #8ABB40
//            Chartreuse #E2E11B | Dark Blue #004F6E | Light Blue #00A5B5

// 10-shade scale anchored to UO Green #007030 (index 6 = primary)
const uoGreen: MantineColorsTuple = [
  '#e6f4ec', // 0 – lightest tint
  '#c2e3cf', // 1
  '#9dd2b2', // 2
  '#78c195', // 3
  '#4dab73', // 4
  '#2a9258', // 5
  '#007030', // 6 – UO Green (primary)
  '#005e27', // 7
  '#004c1f', // 8
  '#003914', // 9 – deepest shade
];

// 10-shade scale anchored to UO Yellow #FEE11A (index 6 = primary)
const uoYellow: MantineColorsTuple = [
  '#fffde6', // 0
  '#fffac0', // 1
  '#fff799', // 2
  '#fff36e', // 3
  '#feec3f', // 4
  '#fee629', // 5
  '#FEE11A', // 6 – UO Yellow (primary)
  '#d4ba12', // 7
  '#aa950d', // 8
  '#7f6f08', // 9
];

// 10-shade scale anchored to UO Dark Blue #004F6E (index 6)
const uoDarkBlue: MantineColorsTuple = [
  '#e0f0f7', // 0
  '#b3d9ec', // 1
  '#80bfe0', // 2
  '#4da5d4', // 3
  '#2090c6', // 4
  '#007ab2', // 5
  '#004F6E', // 6 – UO Dark Blue
  '#003f59', // 7
  '#002f43', // 8
  '#001f2d', // 9
];

export const uoTheme = createTheme({
  // Primary color used across buttons, links, and interactive elements
  primaryColor: 'uoGreen',
  primaryShade: 6,

  colors: {
    uoGreen,
    uoYellow,
    uoDarkBlue,
  },

  // Typography — UO brand uses clean sans-serif; Mantine defaults to system stack
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Global heading styles
  headings: {
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.25rem' },
      h2: { fontSize: '1.75rem' },
      h3: { fontSize: '1.375rem' },
    },
  },

  // Default border radius — slightly rounded, professional
  defaultRadius: 'sm',

  // Component-level overrides
  components: {
    Button: {
      defaultProps: {
        color: 'uoGreen',
      },
    },
    Badge: {
      defaultProps: {
        color: 'uoGreen',
        variant: 'filled',
      },
    },
    NavLink: {
      defaultProps: {
        color: 'uoGreen',
      },
    },
    Anchor: {
      defaultProps: {
        color: 'uoGreen',
      },
    },
    Tabs: {
      defaultProps: {
        color: 'uoGreen',
      },
    },
    Chip: {
      defaultProps: {
        color: 'uoGreen',
      },
    },
  },
});
