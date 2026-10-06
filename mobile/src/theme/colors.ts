// BRIGHTHOMES palette, shared with the website design tokens (website/src/index.css).
// Charcoal foundations, warm white surfaces, stone neutrals and a restrained bronze accent.
// Small text on light surfaces uses bronzeDark; bronze and bronzeLight are for lines, large
// type and dark surfaces, where their contrast is sufficient.
export const colors = {
  ink: '#161513',
  charcoal: '#22211f',
  graphite: '#3a3835',
  stone600: '#5f5a52',
  stone500: '#7a746a',
  stone400: '#a59e92',
  stone300: '#cfc8bc',
  stone200: '#e2dcd1',
  bone: '#ece7de',
  paper: '#f6f3ee',
  bronze: '#a9844f',
  bronzeLight: '#c9a46a',
  bronzeDark: '#7a5a2c',
  success: '#3f6b4a',
  danger: '#9b3b2f',
  // Danger tint for use on dark surfaces.
  dangerLight: '#e3958a',
  white: '#ffffff',
  scrim: 'rgba(22, 21, 19, 0.6)',
} as const
