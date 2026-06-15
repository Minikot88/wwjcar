import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

export default function AdminUploads() {
  const { data } = useCmsResource(() => cmsService.getUploads(), [], []);
  const [file, setFile] = useState(null);
  const [usageType, setUsageType] = useState('general');
  const [message, setMessage] = useState('');

  const upload = async () => {
    if (!file) return;
    const result = await cmsService.uploadFile(file, usageType);
    setMessage(`อัปโหลดแล้ว: ${result.fileUrl}`);
    setFile(null);
  };

  return (
    <AdminPanel title="ไฟล์อัปโหลด" description="อัปโหลดรูปภาพ โลโก้ Hero รูปรถ และแกลเลอรีไปยัง /uploads">
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' }, alignItems: 'center' }}>
          <Button variant="outlined" component="label">
            เลือกไฟล์
            <input hidden type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </Button>
          <TextField label="ประเภทการใช้งาน" value={usageType} onChange={(event) => setUsageType(event.target.value)} />
          <Button variant="contained" onClick={upload} disabled={!file}>
            อัปโหลด
          </Button>
        </Box>
        {file ? <Typography color="text.secondary">ไฟล์ที่เลือก: {file.name}</Typography> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
          {data.map((item) => (
            <Stack key={item.id} spacing={1.25} sx={{ bgcolor: colors.canvasElevated, borderRadius: '20px', p: 2 }}>
              <Box component="img" src={item.fileUrl} alt={item.originalName} sx={{ aspectRatio: '4 / 3', borderRadius: '16px', objectFit: 'cover', width: '100%' }} />
              <Typography sx={{ fontWeight: 750 }}>{item.originalName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.fileUrl}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Stack>
    </AdminPanel>
  );
}
