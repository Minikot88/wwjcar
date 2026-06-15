import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router';
import Seo from '../components/seo/Seo.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="ไม่พบหน้านี้" canonical="/404" robots="noindex,follow" />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box>
          <Typography component="h1" variant="h1" gutterBottom>
            ไม่พบหน้านี้
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            หน้าที่คุณกำลังค้นหาอาจถูกย้าย หรือรถคันนี้อาจไม่มีในรายการแล้ว
          </Typography>
          <Button component={Link} to="/" variant="contained">
            กลับหน้าแรก
          </Button>
        </Box>
      </Container>
    </>
  );
}
