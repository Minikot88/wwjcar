import { env } from '../config/env.js';

export function notFoundHandler(request, _response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function mapMulterMessage(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return 'ไฟล์รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน 8 MB';
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return 'ช่องอัปโหลดไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์จากช่องที่ระบบกำหนด';
  }

  return 'อัปโหลดไฟล์ไม่สำเร็จ กรุณาตรวจสอบไฟล์แล้วลองใหม่อีกครั้ง';
}

export function errorHandler(error, _request, response, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message;

  if (error.code === '23P01') {
    statusCode = 409;
    message = 'ข้อมูลช่วงวันที่ซ้ำกับรายการที่มีอยู่แล้ว';
  } else if (error.code === '23505') {
    statusCode = 409;
    message = 'ข้อมูลนี้มีอยู่ในระบบแล้ว';
  } else if (error.code === '23503') {
    statusCode = 409;
    message = 'ไม่สามารถดำเนินการได้ เพราะข้อมูลนี้ถูกใช้งานอยู่';
  } else if (error.name === 'MulterError') {
    statusCode = 422;
    message = mapMulterMessage(error);
  }

  response.status(statusCode).json({
    success: false,
    message: statusCode === 500 && env.nodeEnv === 'production' ? 'Internal server error' : message,
    details: error.details || undefined,
    code: error.code || undefined,
    stack: env.nodeEnv === 'development' ? error.stack : undefined
  });
}
