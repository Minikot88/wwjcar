export const responsiveValue = (xs, sm, md, lg, xl) => ({
  xs,
  ...(sm !== undefined ? { sm } : {}),
  ...(md !== undefined ? { md } : {}),
  ...(lg !== undefined ? { lg } : {}),
  ...(xl !== undefined ? { xl } : {})
});

export const gridColumns = ({ xs = 1, sm = 2, md = 3, lg = 4, xl = lg } = {}) => ({
  display: 'grid',
  gridTemplateColumns: {
    xs: `repeat(${xs}, minmax(0, 1fr))`,
    sm: `repeat(${sm}, minmax(0, 1fr))`,
    md: `repeat(${md}, minmax(0, 1fr))`,
    lg: `repeat(${lg}, minmax(0, 1fr))`,
    xl: `repeat(${xl}, minmax(0, 1fr))`
  }
});
