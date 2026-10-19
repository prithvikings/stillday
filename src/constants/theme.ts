export const lightColors = {
  background: "#F7F5EF",
  surface: "#EAE6DA",
  primary: "#39745F",
  primaryDark: "#294D3C",
  text: "#26382F",
  textSecondary: "#85877D",
  border: "#DCD8CC",
  white: "#FFFFFF",
  danger: "#A4473D",
  card: "#FFFFFF",
  tabBar: "#F7F5EF",
  muted: "#F0EDE4",
} as const;

export const darkColors = {
  background: "#171E1A",
  surface: "#242D27",
  primary: "#82B49A",
  primaryDark: "#A1CDB3",
  text: "#E8EDE7",
  textSecondary: "#A0ACA2",
  border: "#39443C",
  white: "#FFFFFF",
  danger: "#E28C80",
  card: "#202822",
  tabBar: "#1B231D",
  muted: "#2C362F",
} as const;

// Keep the existing light-theme export so current screens
// continue working while we migrate them gradually.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export type ThemeColors = {
  [K in keyof typeof lightColors]: string;
};
