import { TextField } from '@mui/material';

export default function JsonEditor({ label, value, onChange, minRows = 7 }) {
  const textValue = typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);

  return (
    <TextField
      label={label}
      value={textValue}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      multiline
      minRows={minRows}
      helperText="ใช้รูปแบบ JSON สำหรับข้อมูลที่แก้ไขได้"
    />
  );
}

export function parseJsonInput(value, fallback = {}) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
