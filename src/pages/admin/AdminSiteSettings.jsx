import { Alert, Button, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import JsonEditor, { parseJsonInput } from '../../components/admin/JsonEditor.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';

const fallbackSettings = [
  {
    key: 'contact',
    value: {
      phone: '',
      line: '',
      whatsapp: '',
      facebook: '',
      email: '',
      googleMaps: '',
      businessHours: 'เปิดบริการทุกวัน',
      footerText: ''
    }
  },
  {
    key: 'seoDefaults',
    value: {
      title: 'รถเช่าหาดใหญ่ | WWJ Car Rent',
      description: 'รถเช่าหาดใหญ่ ราคาดี รับรถสนามบิน จองง่ายผ่าน LINE'
    }
  }
];

export default function AdminSiteSettings() {
  const { data } = useCmsResource(() => cmsService.getSettings(), fallbackSettings, []);
  const [selectedKey, setSelectedKey] = useState('contact');
  const [json, setJson] = useState('{}');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const selected = data.find((item) => item.key === selectedKey) || fallbackSettings[0];
    setJson(JSON.stringify(selected.value, null, 2));
  }, [data, selectedKey]);

  const save = async () => {
    await cmsService.updateSetting(selectedKey, parseJsonInput(json, {}));
    setMessage('บันทึกการตั้งค่าแล้ว');
  };

  return (
    <AdminPanel title="ตั้งค่าเว็บไซต์" description="จัดการช่องทางติดต่อ โซเชียล เวลาทำการ แผนที่ และ SEO defaults">
      <Stack spacing={3}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        <TextField label="กลุ่มการตั้งค่า" select SelectProps={{ native: true }} value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
          {data.map((item) => (
            <option key={item.key} value={item.key}>
              {item.key}
            </option>
          ))}
        </TextField>
        <JsonEditor label="ค่า JSON" value={json} onChange={setJson} />
        <Button variant="contained" onClick={save}>
          บันทึก
        </Button>
      </Stack>
    </AdminPanel>
  );
}
