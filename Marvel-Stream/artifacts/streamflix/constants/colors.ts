/**
 * StreamFlix — always-dark streaming palette.
 * Both light and dark keys are identical so the app stays dark
 * regardless of the system colour scheme.
 */

const dark = {
  // legacy aliases
  text: '#FFFFFF',
  tint: '#E50914',

  // core surfaces
  background: '#0B0B0F',
  foreground: '#FFFFFF',

  // elevated surfaces
  card: '#16161C',
  cardForeground: '#FFFFFF',

  // primary — Netflix-style red
  primary: '#E50914',
  primaryForeground: '#FFFFFF',

  // secondary
  secondary: '#1E1E28',
  secondaryForeground: '#FFFFFF',

  // muted
  muted: '#1E1E28',
  mutedForeground: '#6E6E82',

  // accent — gold for ratings
  accent: '#F5A623',
  accentForeground: '#0B0B0F',

  // destructive
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',

  // borders / inputs
  border: '#2A2A36',
  input: '#2A2A36',
};

const colors = {
  light: dark,
  dark,
  radius: 10,
};

export default colors;
