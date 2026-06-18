import { HttpError } from './httpError.js';

const allowedMimeTypes = new Map([
  ['image/png', 'PNG'],
  ['image/jpeg', 'JPEG'],
  ['image/jpg', 'JPEG'],
  ['image/webp', 'WebP']
]);

function hasPngSignature(bytes) {
  return bytes.length >= 24
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a;
}

function hasJpegSignature(bytes) {
  return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function hasWebpSignature(bytes) {
  return bytes.length >= 30
    && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
}

function parsePngDimensions(bytes) {
  if (!hasPngSignature(bytes)) return null;
  const ihdr = bytes.subarray(12, 16).toString('ascii');
  if (ihdr !== 'IHDR') return null;

  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  return width > 0 && height > 0 ? { type: 'PNG', width, height } : null;
}

function parseJpegDimensions(bytes) {
  if (!hasJpegSignature(bytes)) return null;

  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > bytes.length) return null;

    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;

    const isStartOfFrame = (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb)
      || (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      if (offset + 7 > bytes.length) return null;
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      return width > 0 && height > 0 ? { type: 'JPEG', width, height } : null;
    }

    offset += segmentLength;
  }

  return null;
}

function parseWebpDimensions(bytes) {
  if (!hasWebpSignature(bytes)) return null;

  const chunk = bytes.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    if (bytes.length < 30) return null;
    const width = 1 + bytes.readUIntLE(24, 3);
    const height = 1 + bytes.readUIntLE(27, 3);
    return width > 0 && height > 0 ? { type: 'WebP', width, height } : null;
  }

  if (chunk === 'VP8 ') {
    if (bytes.length < 30) return null;
    const width = bytes.readUInt16LE(26) & 0x3fff;
    const height = bytes.readUInt16LE(28) & 0x3fff;
    return width > 0 && height > 0 ? { type: 'WebP', width, height } : null;
  }

  if (chunk === 'VP8L') {
    if (bytes.length < 25 || bytes[20] !== 0x2f) return null;
    const bits = bytes.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return width > 0 && height > 0 ? { type: 'WebP', width, height } : null;
  }

  return null;
}

export function assertSupportedImageMime(mimetype) {
  const normalizedMimeType = String(mimetype || '').toLowerCase();
  if (!allowedMimeTypes.has(normalizedMimeType)) {
    throw new HttpError(422, 'รองรับเฉพาะไฟล์รูปภาพ PNG, JPG, JPEG หรือ WebP เท่านั้น', {
      type: 'unsupported_image',
      allowedTypes: Array.from(allowedMimeTypes.keys())
    });
  }
}

export function validateUploadedImage(file) {
  if (!file) {
    throw new HttpError(422, 'กรุณาเลือกรูปภาพก่อนอัปโหลด', { type: 'missing_image' });
  }

  assertSupportedImageMime(file.mimetype);

  if (!file.buffer || file.buffer.length === 0) {
    throw new HttpError(422, 'ไฟล์รูปภาพว่างหรืออ่านข้อมูลไม่ได้ กรุณาเลือกไฟล์ใหม่', { type: 'invalid_image' });
  }

  const detectedImage = parsePngDimensions(file.buffer)
    || parseJpegDimensions(file.buffer)
    || parseWebpDimensions(file.buffer);

  if (!detectedImage) {
    const hasAllowedSignature = hasPngSignature(file.buffer)
      || hasJpegSignature(file.buffer)
      || hasWebpSignature(file.buffer);

    throw new HttpError(
      422,
      hasAllowedSignature
        ? 'ไฟล์รูปภาพเสียหายหรืออ่านโครงสร้างรูปไม่ได้ กรุณาอัปโหลดรูปใหม่'
        : 'ไฟล์ที่อัปโหลดไม่ใช่รูปภาพที่ถูกต้อง กรุณาใช้ไฟล์ PNG, JPG, JPEG หรือ WebP',
      { type: hasAllowedSignature ? 'corrupt_image' : 'invalid_image' }
    );
  }

  file.detectedImage = detectedImage;
  return detectedImage;
}

export function mapCloudinaryError(error) {
  const message = String(error?.message || '').toLowerCase();
  const httpCode = Number(error?.http_code || error?.statusCode || error?.status);

  const cloudinaryValidationPatterns = [
    'invalid image',
    'image file is corrupted',
    'corrupt',
    'unsupported image',
    'not an allowed format',
    'resource_type',
    'unknown image file format'
  ];

  if (httpCode === 400 || cloudinaryValidationPatterns.some((pattern) => message.includes(pattern))) {
    return new HttpError(422, 'Cloudinary ไม่สามารถประมวลผลรูปภาพนี้ได้ กรุณาตรวจสอบว่าไฟล์ไม่เสียหายและเป็น PNG, JPG, JPEG หรือ WebP', {
      type: 'cloudinary_image_rejected',
      providerMessage: error?.message
    });
  }

  return new HttpError(502, 'อัปโหลดรูปไปยัง Cloudinary ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', {
    type: 'cloudinary_upload_failed',
    providerMessage: error?.message
  });
}

export function mapCloudinaryDeleteError(error) {
  return new HttpError(502, 'ลบรูปจาก Cloudinary ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', {
    type: 'cloudinary_delete_failed',
    providerMessage: error?.message
  });
}
