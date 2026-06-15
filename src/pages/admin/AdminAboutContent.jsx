import { Alert, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import JsonEditor, { parseJsonInput } from '../../components/admin/JsonEditor.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';

const fallbackAbout = {
  companyStory: '',
  serviceAreas: ['Hat Yai', 'Songkhla', 'Hat Yai Airport'],
  airportPickupContent: '',
  customerFirstPhilosophy: '',
  whyChooseWWJ: []
};

export default function AdminAboutContent() {
  const { data } = useCmsResource(() => cmsService.getSettings(), [{ key: 'about', value: fallbackAbout }], []);
  const [json, setJson] = useState(JSON.stringify(fallbackAbout, null, 2));
  const [message, setMessage] = useState('');

  useEffect(() => {
    const about = data.find((item) => item.key === 'about');
    if (about) setJson(JSON.stringify(about.value, null, 2));
  }, [data]);

  const save = async () => {
    await cmsService.updateSetting('about', parseJsonInput(json, fallbackAbout));
    setMessage('บันทึกเกี่ยวกับเราแล้ว');
  };

  return (
    <AdminPanel title="เกี่ยวกับเรา" description="แก้ไขเรื่องราวบริษัท พื้นที่ให้บริการ รับรถสนามบิน และเหตุผลที่ลูกค้าเลือก WWJ">
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <JsonEditor label="About Content JSON" value={json} onChange={setJson} />
        <Button variant="contained" onClick={save}>
          บันทึก
        </Button>
      </Stack>
    </AdminPanel>
  );
}
