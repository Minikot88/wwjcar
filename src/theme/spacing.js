export const spacing = {
  xxxs: 4,
  xxs: 8,
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  xxl: 96,
  super: 128
};

export const sectionSpacing = {
  compact: {
    xs: spacing.lg,
    md: spacing.xl
  },
  standard: {
    xs: spacing.xl,
    md: spacing.super
  },
  editorial: {
    xs: spacing.xxl,
    md: spacing.super + spacing.md
  }
};
