export function required(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `กรุณากรอก${label}`;
  }
  return '';
}

export function positiveNumber(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return `${label}ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป`;
  }
  return '';
}

export function slug(value, label = 'Slug') {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''))) {
    return `${label}ใช้ได้เฉพาะตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข และเครื่องหมายขีดกลาง`;
  }
  return '';
}

export function firstError(errors) {
  return errors.find(Boolean) || '';
}
