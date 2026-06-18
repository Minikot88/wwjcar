import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { carsRepository } from '../repositories/carsRepository.js';
import { dashboardRepository } from '../repositories/dashboardRepository.js';
import { faqsRepository } from '../repositories/faqsRepository.js';
import { pagesRepository } from '../repositories/pagesRepository.js';
import { rentalConditionsRepository } from '../repositories/rentalConditionsRepository.js';
import { reviewsRepository } from '../repositories/reviewsRepository.js';
import { settingsRepository } from '../repositories/settingsRepository.js';
import { uploadsRepository } from '../repositories/uploadsRepository.js';
import { auditRepository } from '../repositories/auditRepository.js';
import { HttpError } from '../utils/httpError.js';
import { mapCloudinaryDeleteError, mapCloudinaryError, validateUploadedImage } from '../utils/imageValidation.js';

function boolParam(value) {
  return value === true || value === 'true' || value === '1';
}

async function uploadImageToCloudinary(file, payload = {}, user = null) {
  validateUploadedImage(file);
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new HttpError(502, 'ยังไม่ได้ตั้งค่า Cloudinary สำหรับอัปโหลดรูปภาพ', { type: 'cloudinary_not_configured' });
  }

  let uploadResult;
  try {
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: payload.folder || env.cloudinary.folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          context: payload.context || undefined,
          tags: payload.tags || undefined
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.on('error', reject);
      stream.end(file.buffer);
    });
  } catch (error) {
    throw mapCloudinaryError(error);
  }

  return uploadsRepository.create({
    publicId: uploadResult.public_id,
    originalName: file.originalname,
    fileName: uploadResult.original_filename || file.originalname,
    fileUrl: uploadResult.secure_url,
    secureUrl: uploadResult.secure_url,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    bytes: uploadResult.bytes || file.size,
    format: uploadResult.format || null,
    resourceType: uploadResult.resource_type || 'image',
    width: uploadResult.width,
    height: uploadResult.height,
    usageType: payload.usageType || 'general',
    createdBy: user?.id
  });
}

async function replaceImageInCloudinary(uploadId, file, payload = {}, user = null) {
  const currentUpload = await uploadsRepository.findById(uploadId);
  if (!currentUpload || currentUpload.deletedAt) throw new HttpError(404, 'ไม่พบไฟล์อัปโหลดนี้');

  validateUploadedImage(file);
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new HttpError(502, 'ยังไม่ได้ตั้งค่า Cloudinary สำหรับอัปโหลดรูปภาพ', { type: 'cloudinary_not_configured' });
  }

  let uploadResult;
  try {
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: payload.folder || env.cloudinary.folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          context: payload.context || undefined,
          tags: payload.tags || undefined
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.on('error', reject);
      stream.end(file.buffer);
    });
  } catch (error) {
    throw mapCloudinaryError(error);
  }

  const upload = await uploadsRepository.replace(uploadId, {
    publicId: uploadResult.public_id,
    originalName: file.originalname,
    fileName: uploadResult.original_filename || file.originalname,
    fileUrl: uploadResult.secure_url,
    secureUrl: uploadResult.secure_url,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    bytes: uploadResult.bytes || file.size,
    format: uploadResult.format || null,
    resourceType: uploadResult.resource_type || 'image',
    width: uploadResult.width,
    height: uploadResult.height,
    usageType: payload.usageType || currentUpload.usageType || 'general',
    createdBy: user?.id
  });

  if (currentUpload.publicId) {
    try {
      await cloudinary.uploader.destroy(currentUpload.publicId, { resource_type: currentUpload.resourceType || 'image' });
    } catch (error) {
      throw mapCloudinaryDeleteError(error);
    }
  }

  return upload;
}

async function deleteCloudinaryAsset(publicId, resourceType = 'image') {
  if (!publicId) return;
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new HttpError(502, 'ยังไม่ได้ตั้งค่า Cloudinary สำหรับจัดการรูปภาพ', { type: 'cloudinary_not_configured' });
  }
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' });
  } catch (error) {
    throw mapCloudinaryDeleteError(error);
  }
}

function sendList(response, result) {
  if (Array.isArray(result)) {
    response.json(result);
    return;
  }

  response.set('X-Total-Count', String(result.total || result.items.length));
  response.json(result.items);
}

export const cmsController = {
  dashboard: async (_request, response) => response.json(await dashboardRepository.getSummary()),

  listCars: async (request, response) => {
    const result = await carsRepository.list({
      includeDrafts: boolParam(request.query.includeDrafts),
      search: request.query.search,
      brand: request.query.brand,
      transmission: request.query.transmission,
      sort: request.query.sort,
      page: request.query.page,
      pageSize: request.query.pageSize
    });
    sendList(response, result);
  },

  getCar: async (request, response) => {
    const car = await carsRepository.findBySlug(request.params.slug, boolParam(request.query.includeDrafts));
    if (!car) throw new HttpError(404, 'ไม่พบข้อมูลรถ');
    response.json(car);
  },

  createCar: async (request, response) => {
    const car = await carsRepository.create(request.body);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'car', entityId: car.id, metadata: { slug: car.slug }, request });
    response.status(201).json(car);
  },
  updateCar: async (request, response) => {
    const car = await carsRepository.update(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'car', entityId: request.params.id, metadata: { slug: car?.slug }, request });
    response.json(car);
  },
  deleteCar: async (request, response) => {
    await carsRepository.delete(request.params.id);
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'car', entityId: request.params.id, request });
    response.json({ success: true });
  },

  uploadCarCover: async (request, response) => {
    const previousCover = await carsRepository.findCoverImageByCarId(request.params.id);
    const upload = await uploadImageToCloudinary(request.file, { usageType: 'car_cover', tags: ['car_cover', `car_${request.params.id}`] }, request.user);
    const car = await carsRepository.setCoverImage(request.params.id, upload);
    if (previousCover?.publicId && previousCover.uploadId !== upload.id) {
      await deleteCloudinaryAsset(previousCover.publicId, previousCover.resourceType);
      await carsRepository.deleteImage(previousCover.id);
      if (previousCover.uploadId) await uploadsRepository.delete(previousCover.uploadId);
    }
    await auditRepository.create({ user: request.user, action: 'upload_cover', entityType: 'car', entityId: request.params.id, metadata: { uploadId: upload.id }, request });
    response.status(201).json({ upload, car });
  },

  uploadCarGallery: async (request, response) => {
    const upload = await uploadImageToCloudinary(request.file, { usageType: 'car_gallery', tags: ['car_gallery', `car_${request.params.id}`] }, request.user);
    const image = await carsRepository.addGalleryImage(request.params.id, upload, request.body);
    await auditRepository.create({ user: request.user, action: 'upload_gallery', entityType: 'car_image', entityId: image.id, metadata: { carId: request.params.id, uploadId: upload.id }, request });
    response.status(201).json({ upload, image });
  },

  deleteCarImage: async (request, response) => {
    const image = await carsRepository.findImageById(request.params.id);
    if (!image) throw new HttpError(404, 'Car image not found');
    if (image?.publicId) await deleteCloudinaryAsset(image.publicId);
    await carsRepository.deleteImage(request.params.id);
    if (image?.uploadId) await uploadsRepository.delete(image.uploadId);
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'car_image', entityId: request.params.id, metadata: { uploadId: image?.uploadId }, request });
    response.json({ success: true });
  },

  replaceCarImage: async (request, response) => {
    const currentImage = await carsRepository.findImageById(request.params.id);
    if (!currentImage) throw new HttpError(404, 'Car image not found');
    const upload = await uploadImageToCloudinary(request.file, {
      usageType: currentImage.isCover ? 'car_cover' : 'car_gallery',
      tags: ['car_image', `car_${currentImage.carId}`]
    }, request.user);
    const image = await carsRepository.replaceImage(request.params.id, upload, request.body);
    if (currentImage.publicId) await deleteCloudinaryAsset(currentImage.publicId, currentImage.resourceType);
    if (currentImage.uploadId) await uploadsRepository.delete(currentImage.uploadId);
    await auditRepository.create({ user: request.user, action: 'replace', entityType: 'car_image', entityId: request.params.id, metadata: { oldUploadId: currentImage.uploadId, uploadId: upload.id }, request });
    response.json({ upload, image });
  },

  reorderCarGallery: async (request, response) => {
    const gallery = await carsRepository.reorderGallery(request.params.id, request.body.images || []);
    await auditRepository.create({ user: request.user, action: 'reorder_gallery', entityType: 'car', entityId: request.params.id, metadata: { imageCount: gallery.length }, request });
    response.json({ gallery });
  },

  listFaqs: async (request, response) => response.json(await faqsRepository.list(boolParam(request.query.includeDrafts))),
  listFaqCategories: async (_request, response) => response.json(await faqsRepository.categories()),
  createFaq: async (request, response) => {
    const faq = await faqsRepository.create(request.body);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'faq', entityId: faq.id, request });
    response.status(201).json(faq);
  },
  updateFaq: async (request, response) => {
    const faq = await faqsRepository.update(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'faq', entityId: request.params.id, request });
    response.json(faq);
  },
  deleteFaq: async (request, response) => {
    await faqsRepository.delete(request.params.id);
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'faq', entityId: request.params.id, request });
    response.json({ success: true });
  },

  listSettings: async (request, response) => {
    const isAdmin = request.user?.role === 'admin';
    response.json(await settingsRepository.list({ publicOnly: !isAdmin }));
  },
  updateSetting: async (request, response) => {
    const setting = await settingsRepository.upsert(request.params.key, request.body.value);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'setting', entityId: request.params.key, request });
    response.json(setting);
  },

  uploadSettingImage: async (request, response) => {
    const usageType = request.body.usageType || `${request.params.key}_image`;
    const upload = await uploadImageToCloudinary(request.file, { usageType, tags: ['setting', request.params.key] }, request.user);
    const setting = await settingsRepository.updateImage(request.params.key, {
      fieldPath: request.body.fieldPath || 'image',
      imageUrl: upload.secureUrl || upload.fileUrl
    });
    await auditRepository.create({ user: request.user, action: 'upload_image', entityType: 'setting', entityId: request.params.key, metadata: { uploadId: upload.id }, request });
    response.status(201).json({ upload, setting });
  },

  listPages: async (request, response) => {
    const includeDrafts = request.user?.role === 'admin' && boolParam(request.query.includeDrafts);
    response.json(await pagesRepository.list(includeDrafts));
  },
  getPage: async (request, response) => {
    const includeDrafts = request.user?.role === 'admin' && boolParam(request.query.includeDrafts);
    const page = await pagesRepository.findBySlug(request.params.slug, includeDrafts);
    if (!page) throw new HttpError(404, 'Page not found');
    response.json(page);
  },
  createPage: async (request, response) => {
    const page = await pagesRepository.create({ ...request.body, updatedBy: request.user?.id });
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'page', entityId: page.id, metadata: { slug: page.slug }, request });
    response.status(201).json(page);
  },
  updatePage: async (request, response) => {
    const page = await pagesRepository.update(request.params.id, { ...request.body, updatedBy: request.user?.id });
    if (!page) throw new HttpError(404, 'Page not found');
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'page', entityId: request.params.id, metadata: { slug: page?.slug }, request });
    response.json(page);
  },
  updatePageStatus: async (request, response) => {
    const page = await pagesRepository.updateStatus(request.params.id, request.body.status, request.user?.id);
    if (!page) throw new HttpError(404, 'Page not found');
    await auditRepository.create({ user: request.user, action: request.body.status, entityType: 'page', entityId: request.params.id, metadata: { slug: page.slug, status: page.status }, request });
    response.json(page);
  },
  duplicatePage: async (request, response) => {
    const page = await pagesRepository.duplicate(request.params.id, request.user?.id);
    if (!page) throw new HttpError(404, 'Page not found');
    await auditRepository.create({ user: request.user, action: 'duplicate', entityType: 'page', entityId: page.id, metadata: { slug: page.slug, sourceId: request.params.id }, request });
    response.status(201).json(page);
  },
  deletePage: async (request, response) => {
    await pagesRepository.delete(request.params.id);
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'page', entityId: request.params.id, request });
    response.json({ success: true });
  },

  uploadPageImage: async (request, response) => {
    const upload = await uploadImageToCloudinary(request.file, { usageType: request.body.usageType || 'page_image', tags: ['page', `page_${request.params.id}`] }, request.user);
    const page = await pagesRepository.updateImage(request.params.id, {
      field: request.body.field || 'ogImage',
      fieldPath: request.body.fieldPath,
      imageUrl: upload.secureUrl || upload.fileUrl,
      updatedBy: request.user?.id
    });
    if (!page) throw new HttpError(404, 'Page not found');
    await auditRepository.create({ user: request.user, action: 'upload_image', entityType: 'page', entityId: request.params.id, metadata: { uploadId: upload.id }, request });
    response.status(201).json({ upload, page });
  },

  listRentalConditions: async (_request, response) => response.json(await rentalConditionsRepository.list()),
  createRentalCondition: async (request, response) => {
    const condition = await rentalConditionsRepository.create(request.body);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'rental_condition', entityId: condition.id, request });
    response.status(201).json(condition);
  },
  updateRentalCondition: async (request, response) => {
    const condition = await rentalConditionsRepository.update(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'rental_condition', entityId: request.params.id, request });
    response.json(condition);
  },
  deleteRentalCondition: async (request, response) => {
    await rentalConditionsRepository.delete(request.params.id);
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'rental_condition', entityId: request.params.id, request });
    response.json({ success: true });
  },

  listReviews: async (request, response) => response.json(await reviewsRepository.list(boolParam(request.query.includeDrafts))),
  createReview: async (request, response) => {
    const review = await reviewsRepository.create(request.body);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'review', entityId: review.id, request });
    response.status(201).json(review);
  },
  updateReview: async (request, response) => {
    const review = await reviewsRepository.update(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'review', entityId: request.params.id, request });
    response.json(review);
  },
  deleteReview: async (request, response) => {
    const review = await reviewsRepository.findById(request.params.id);
    if (review?.imageUploadId) {
      const upload = await uploadsRepository.findById(review.imageUploadId);
      if (upload?.publicId && !upload.deletedAt) await deleteCloudinaryAsset(upload.publicId, upload.resourceType);
      if (upload && !upload.deletedAt) await uploadsRepository.delete(upload.id);
    }
    await reviewsRepository.delete(request.params.id);
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'review', entityId: request.params.id, request });
    response.json({ success: true });
  },

  uploadReviewImage: async (request, response) => {
    const review = await reviewsRepository.findById(request.params.id);
    if (!review) throw new HttpError(404, 'Review not found');
    const previousUpload = review.imageUploadId ? await uploadsRepository.findById(review.imageUploadId) : null;
    const upload = await uploadImageToCloudinary(request.file, { usageType: 'review_image', tags: ['review', `review_${request.params.id}`] }, request.user);
    const updatedReview = await reviewsRepository.setImage(request.params.id, upload);
    if (previousUpload?.publicId && !previousUpload.deletedAt) await deleteCloudinaryAsset(previousUpload.publicId, previousUpload.resourceType);
    if (previousUpload && !previousUpload.deletedAt) await uploadsRepository.delete(previousUpload.id);
    await auditRepository.create({ user: request.user, action: 'upload_image', entityType: 'review', entityId: request.params.id, metadata: { uploadId: upload.id }, request });
    response.status(201).json({ upload, review: updatedReview });
  },

  listUploads: async (_request, response) => response.json(await uploadsRepository.list()),
  uploadFile: async (request, response) => {
    const upload = await uploadImageToCloudinary(request.file, { usageType: request.body.usageType || 'general' }, request.user);
    await auditRepository.create({ user: request.user, action: 'upload', entityType: 'upload', entityId: upload.id, metadata: { usageType: upload.usageType }, request });

    response.status(201).json(upload);
  },
  replaceUpload: async (request, response) => {
    const upload = await replaceImageInCloudinary(request.params.id, request.file, { usageType: request.body.usageType }, request.user);
    await auditRepository.create({ user: request.user, action: 'replace', entityType: 'upload', entityId: upload.id, metadata: { usageType: upload.usageType }, request });
    response.json(upload);
  },
  deleteUpload: async (request, response) => {
    const upload = await uploadsRepository.findById(request.params.id);
    if (!upload || upload.deletedAt) throw new HttpError(404, 'Upload not found');
    const referenceCount = await uploadsRepository.referenceCount(upload);
    if (referenceCount > 0) {
      throw new HttpError(409, 'Upload is still used by CMS content. Replace or remove references before deleting.', { referenceCount });
    }
    await deleteCloudinaryAsset(upload.publicId, upload.resourceType);
    const deleted = await uploadsRepository.delete(request.params.id);
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'upload', entityId: request.params.id, metadata: { publicId: upload.publicId }, request });
    response.json({ success: true, upload: deleted });
  }
};
