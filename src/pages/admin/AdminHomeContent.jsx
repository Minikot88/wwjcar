import { Alert, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import JsonEditor, { parseJsonInput } from '../../components/admin/JsonEditor.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';

const fallbackHome = {
  heroTitle: 'รถเช่าหาดใหญ่ จองง่าย รับรถไว',
  heroSubtitle: 'รับรถสนามบินหาดใหญ่ เลือกรถสะดวก และคุยกับทีมงานได้โดยตรงก่อนจอง',
  heroImage: '/photo/wwj-carrent.webp',
  primaryCtaText: 'จองผ่าน LINE',
  secondaryCtaText: 'ดูรถทั้งหมด',
  trustItems: ['รถสะอาด', 'รับรถสนามบิน', 'จองผ่าน LINE']
};

export default function AdminHomeContent() {
  const { data } = useCmsResource(() => cmsService.getSettings(), [{ key: 'home', value: fallbackHome }], []);
  const [json, setJson] = useState(JSON.stringify(fallbackHome, null, 2));
  const [message, setMessage] = useState('');

  useEffect(() => {
    const home = data.find((item) => item.key === 'home');
    if (home) setJson(JSON.stringify(home.value, null, 2));
  }, [data]);

  const save = async () => {
    await cmsService.updateSetting('home', parseJsonInput(json, fallbackHome));
    setMessage('บันทึกหน้าแรกแล้ว');
  };

  return (
    <AdminPanel title="หน้าแรก" description="แก้ไข Hero Title, Subtitle, Image, CTA และ Trust Items">
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <JsonEditor label="ข้อมูลหน้าแรก" value={json} onChange={setJson} />
        <Button variant="contained" onClick={save}>
          บันทึก
        </Button>
      </Stack>
    </AdminPanel>
  );
}
