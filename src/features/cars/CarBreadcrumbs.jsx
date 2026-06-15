import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router';
import { colors } from '../../theme/colors.js';

export default function CarBreadcrumbs({ car }) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{
        color: colors.body,
        '& .MuiBreadcrumbs-separator': {
          color: colors.muted
        }
      }}
    >
      <MuiLink component={Link} to="/" underline="hover" sx={{ color: colors.body }}>
        หน้าแรก
      </MuiLink>
      <MuiLink component={Link} to="/cars" underline="hover" sx={{ color: colors.body }}>
        รถเช่า
      </MuiLink>
      {car ? <Typography sx={{ color: colors.ink }}>{car.name}</Typography> : null}
    </Breadcrumbs>
  );
}
