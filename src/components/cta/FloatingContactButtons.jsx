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
        left: { xs: 10, md: 'auto' },
        right: { xs: 10, md: 24 },
        bottom: { xs: 10, md: 24 },
        zIndex: 1200,
        display: 'flex',
        flexDirection: { xs: 'row', md: 'row' },
        gap: { xs: 0.75, md: 1 },
        border: { xs: `1px solid ${colors.hairlineSoft}`, md: 0 },
        borderRadius: { xs: '24px', md: 0 },
        bgcolor: { xs: 'color-mix(in srgb, var(--wwj-bg) 94%, transparent)', md: 'transparent' },
        boxShadow: { xs: '0 16px 44px rgba(15,17,21,0.12)', md: 'none' },
        backdropFilter: { xs: 'blur(18px)', md: 'none' },
        p: { xs: 0.75, md: 0 },
        pb: { xs: 'calc(6px + env(safe-area-inset-bottom))', md: 0 },
        '& .MuiButton-startIcon': {
          mr: { xs: 0.5, sm: 0.75 }
        }
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
            fontSize: { xs: '0.78rem', sm: '0.86rem' },
            minHeight: { xs: 44, sm: 48 },
            minWidth: 0,
            px: { xs: 0.75, sm: 1.5, md: 2 },
            borderRadius: '999px',
            borderColor: action.primary ? colors.primary : colors.hairline,
            color: action.primary ? colors.onPrimary : colors.ink,
            bgcolor: action.primary ? colors.primary : colors.canvasElevated,
            whiteSpace: 'nowrap',
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
