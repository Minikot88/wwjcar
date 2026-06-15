import ChatIcon from '@mui/icons-material/Chat';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Box, Button } from '@mui/material';
import { colors } from '../../theme/colors.js';
import { contactActions, externalLinkProps } from '../../utils/contactActions.js';

export default function FloatingContactButtons() {
  const actions = [
    { ...contactActions.phone, icon: <LocalPhoneIcon fontSize="small" /> },
    { ...contactActions.line, icon: <ChatIcon fontSize="small" />, primary: true },
    { ...contactActions.whatsapp, icon: <WhatsAppIcon fontSize="small" /> }
  ];

  return (
    <Box
      aria-label="ช่องทางติดต่อด่วน"
      sx={{
        position: 'fixed',
        left: { xs: 0, md: 'auto' },
        right: { xs: 0, md: 24 },
        bottom: { xs: 0, md: 24 },
        zIndex: 1200,
        display: 'flex',
        flexDirection: { xs: 'row', md: 'row' },
        gap: { xs: 0, md: 1 },
        borderTop: { xs: `1px solid ${colors.hairline}`, md: 0 },
        bgcolor: { xs: colors.canvas, md: 'transparent' },
        p: { xs: 1, md: 0 },
        pb: { xs: 'calc(8px + env(safe-area-inset-bottom))', md: 0 }
      }}
    >
      {actions.map((action) => (
        <Button
          key={action.label}
          component="a"
          href={action.href}
          {...externalLinkProps(action)}
          aria-label={action.ariaLabel}
          startIcon={action.icon}
          variant={action.primary ? 'contained' : 'outlined'}
          sx={{
            flex: { xs: 1, md: 'initial' },
            minHeight: 48,
            borderRadius: '999px',
            borderColor: action.primary ? colors.primary : colors.hairline,
            color: action.primary ? colors.onPrimary : colors.ink,
            bgcolor: action.primary ? colors.primary : colors.canvasElevated,
            '&:hover': {
              bgcolor: action.primary ? colors.primaryHover : colors.canvas,
              borderColor: colors.primary
            }
          }}
        >
          {action.shortLabel}
        </Button>
      ))}
    </Box>
  );
}
