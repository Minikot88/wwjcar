import { colors } from './colors.js';
import { spacing } from './spacing.js';

const baseCard = {
  borderRadius: '24px',
  boxShadow: colors.shadowSoft,
  overflow: 'hidden'
};

export const cardStyles = {
  car: {
    ...baseCard,
    backgroundColor: colors.canvasLight,
    color: colors.bodyOnLight,
    border: `1px solid ${colors.hairlineSoft}`,
    p: { xs: `${spacing.sm}px`, md: `${spacing.md}px` }
  },
  review: {
    ...baseCard,
    backgroundColor: colors.canvasElevated,
    color: colors.ink,
    border: `1px solid ${colors.hairlineSoft}`,
    p: { xs: `${spacing.sm}px`, md: `${spacing.md}px` }
  },
  blog: {
    ...baseCard,
    backgroundColor: colors.canvasLight,
    color: colors.ink,
    border: `1px solid ${colors.hairlineSoft}`,
    p: { xs: `${spacing.sm}px`, md: `${spacing.md}px` }
  },
  feature: {
    ...baseCard,
    backgroundColor: colors.canvasLight,
    color: colors.ink,
    border: `1px solid ${colors.hairlineSoft}`,
    p: { xs: `${spacing.sm}px`, md: `${spacing.md}px` }
  }
};
