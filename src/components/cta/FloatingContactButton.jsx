import { IconButton, Tooltip } from '@mui/material';
import { colors } from '../../theme/colors.js';

export default function FloatingContactButton({ href, label, children, primary = false }) {
  return (
    <Tooltip title={label} placement="left">
      <IconButton
        component="a"
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        aria-label={label}
        sx={{
          width: 48,
          height: 48,
          borderRadius: '999px',
          bgcolor: primary ? colors.primary : colors.canvasElevated,
          color: colors.ink,
          border: `1px solid ${primary ? colors.primary : colors.hairline}`,
          '&:hover': {
            bgcolor: primary ? colors.primaryHover : colors.canvas,
            color: colors.ink
          }
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
