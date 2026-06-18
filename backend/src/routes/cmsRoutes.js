import multer from 'multer';
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { availabilityController } from '../controllers/availabilityController.js';
import { businessOperationsController } from '../controllers/businessOperationsController.js';
import { cmsController } from '../controllers/cmsController.js';
import { maintenanceController } from '../controllers/maintenanceController.js';
import { operationsController } from '../controllers/operationsController.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { assertSupportedImageMime, validateUploadedImage } from '../utils/imageValidation.js';

export const cmsRoutes = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    try {
      assertSupportedImageMime(file.mimetype);
      callback(null, true);
    } catch (error) {
      callback(error);
    }
  }
});

function validateImageUpload(request, _response, next) {
  const file = request.file;
  if (!file) {
    next();
    return;
  }

  try {
    validateUploadedImage(file);
    next();
  } catch (error) {
    next(error);
  }
}

const idParam = [param('id').isInt({ min: 1 }), validate];
const slugParam = [param('slug').isSlug(), validate];
const carPayload = [
  body('name').isString().trim().isLength({ min: 1, max: 190 }),
  body('slug').isSlug(),
  body('brand').isString().trim().isLength({ min: 1, max: 120 }),
  body('pricePerDay').isNumeric(),
  body('seats').optional().isInt({ min: 1, max: 12 }),
  body('luggage').optional().isInt({ min: 0, max: 10 }),
  body('status').optional().isIn(['published', 'draft']),
  validate
];
const faqPayload = [
  body('question').isString().trim().isLength({ min: 1, max: 320 }),
  body('answer').isString().trim().isLength({ min: 1 }),
  body('categoryId').optional({ nullable: true }).isInt({ min: 1 }),
  body('status').optional().isIn(['published', 'draft']),
  validate
];
const pagePayload = [
  body('slug').isString().trim().isLength({ min: 1, max: 190 }),
  body('title').isString().trim().isLength({ min: 1, max: 220 }),
  body('content').optional().isObject(),
  body('status').optional().isIn(['published', 'draft', 'hidden', 'archived']),
  validate
];
const pageStatusPayload = [
  body('status').isIn(['published', 'draft', 'hidden', 'archived']),
  validate
];
const rentalConditionPayload = [
  body('sectionKey').isString().trim().isLength({ min: 1, max: 120 }),
  body('title').isString().trim().isLength({ min: 1, max: 220 }),
  body('content').isObject(),
  validate
];
const reviewPayload = [
  body('customerName').isString().trim().isLength({ min: 1, max: 160 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('content').isString().trim().isLength({ min: 1 }),
  body('imageUrl').optional({ nullable: true, checkFalsy: true }).isURL({ require_protocol: true }),
  body('imageUploadId').optional({ nullable: true }).isInt({ min: 1 }),
  body('status').optional().isIn(['published', 'draft']),
  validate
];
const galleryOrderPayload = [
  body('images').isArray(),
  body('images.*.id').isInt({ min: 1 }),
  body('images.*.sortOrder').isInt({ min: 0 }),
  validate
];
const passwordPayload = [
  body('currentPassword').isString().isLength({ min: 8 }),
  body('newPassword').isString().isLength({ min: 10 }),
  validate
];
const profilePayload = [
  body('name').isString().trim().isLength({ min: 1, max: 160 }),
  validate
];
const imageFieldPayload = [
  body('field').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('fieldPath').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('usageType').optional().isString().trim().isLength({ min: 1, max: 80 }),
  validate
];
const availabilityQuery = [
  query('startDate').optional().isISO8601(),
  query('start_date').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query().custom((value) => {
    if ((!value.startDate && !value.start_date) || (!value.endDate && !value.end_date)) {
      throw new Error('startDate and endDate are required');
    }
    return true;
  }),
  validate
];
const calendarQuery = [
  query('year').optional().isInt({ min: 2000, max: 2100 }),
  query('month').optional().isInt({ min: 1, max: 12 }),
  validate
];
const bookingsQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 1, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('vehicleId').optional().isInt({ min: 1 }),
  query('vehicle_id').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['reserved', 'active', 'returned', 'cancelled', 'maintenance', 'booked']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('startDate').optional().isISO8601(),
  query('start_date').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('search').optional().isString().trim().isLength({ max: 190 }),
  validate
];
const bookingPayload = [
  body('vehicleId').optional().isInt({ min: 1 }),
  body('vehicle_id').optional().isInt({ min: 1 }),
  body().custom((value) => {
    if (!value.vehicleId && !value.vehicle_id) throw new Error('vehicleId is required');
    return true;
  }),
  body('customerId').optional({ nullable: true }).isInt({ min: 1 }),
  body('customer_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('customerName').optional().isString().trim().isLength({ min: 1, max: 190 }),
  body('customer_name').optional().isString().trim().isLength({ min: 1, max: 190 }),
  body().custom((value) => {
    if (!value.customerName && !value.customer_name) throw new Error('customerName is required');
    return true;
  }),
  body('phone').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('customerPhone').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('customer_phone').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body().custom((value) => {
    if (!value.phone && !value.customerPhone && !value.customer_phone) throw new Error('customerPhone is required');
    return true;
  }),
  body('startDate').optional().isISO8601(),
  body('start_date').optional().isISO8601(),
  body().custom((value) => {
    if (!value.startDate && !value.start_date) throw new Error('startDate is required');
    return true;
  }),
  body('endDate').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body().custom((value) => {
    if (!value.endDate && !value.end_date) throw new Error('endDate is required');
    return true;
  }),
  body('status').optional().isIn(['reserved', 'active', 'returned', 'cancelled', 'maintenance', 'booked']),
  body('revenueAmount').optional({ nullable: true }).isNumeric(),
  body('revenue_amount').optional({ nullable: true }).isNumeric(),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
  validate
];
const maintenanceQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 1, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('vehicleId').optional().isInt({ min: 1 }),
  query('vehicle_id').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['maintenance', 'returned', 'cancelled']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('search').optional().isString().trim().isLength({ max: 190 }),
  validate
];
const maintenancePayload = [
  body('vehicleId').optional().isInt({ min: 1 }),
  body('vehicle_id').optional().isInt({ min: 1 }),
  body().custom((value) => {
    if (!value.vehicleId && !value.vehicle_id) throw new Error('vehicleId is required');
    return true;
  }),
  body('startDate').optional().isISO8601(),
  body('start_date').optional().isISO8601(),
  body().custom((value) => {
    if (!value.startDate && !value.start_date) throw new Error('startDate is required');
    return true;
  }),
  body('endDate').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body().custom((value) => {
    if (!value.endDate && !value.end_date) throw new Error('endDate is required');
    return true;
  }),
  body('reason').isString().trim().isLength({ min: 1, max: 2000 }),
  body('status').optional().isIn(['maintenance', 'returned', 'cancelled']),
  validate
];
const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 1, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim().isLength({ max: 190 }),
  validate
];
const customerPayload = [
  body('name').isString().trim().isLength({ min: 1, max: 190 }),
  body('phone').isString().trim().isLength({ min: 1, max: 80 }),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  body('address').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
  body('nationality').optional({ nullable: true }).isString().trim().isLength({ max: 120 }),
  body('idCardNumber').optional({ nullable: true }).isString().trim().isLength({ max: 120 }),
  body('drivingLicenseNumber').optional({ nullable: true }).isString().trim().isLength({ max: 120 }),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 4000 }),
  body('notes').optional({ nullable: true }).isString().trim().isLength({ max: 4000 }),
  validate
];
const customerNotePayload = [
  body('note').isString().trim().isLength({ min: 1, max: 4000 }),
  validate
];
const contractPayload = [
  body('contractNumber').isString().trim().isLength({ min: 1, max: 80 }),
  body('customerId').isInt({ min: 1 }),
  body('vehicleId').isInt({ min: 1 }),
  body('bookingId').optional({ nullable: true }).isInt({ min: 1 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('totalAmount').optional().isNumeric(),
  body('status').optional().isIn(['draft', 'active', 'completed', 'cancelled']),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 4000 }),
  body('pdfUrl').optional({ nullable: true }).isURL({ require_protocol: true }),
  validate
];
const attachmentPayload = [
  body('uploadId').optional({ nullable: true }).isInt({ min: 1 }),
  body('attachmentType').isIn(['id_card', 'driving_license', 'contract_pdf', 'other']),
  body('fileUrl').isURL({ require_protocol: true }),
  body('originalName').optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body('mimeType').optional({ nullable: true }).isString().trim().isLength({ max: 120 }),
  validate
];
const expensePayload = [
  body('vehicleId').isInt({ min: 1 }),
  body('expenseDate').isISO8601(),
  body('category').isIn(['fuel', 'maintenance', 'insurance', 'cleaning', 'other']),
  body('amount').isNumeric(),
  body('vendor').optional({ nullable: true }).isString().trim().isLength({ max: 190 }),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 4000 }),
  validate
];

cmsRoutes.get('/health', (_request, response) => response.json({ status: 'ok' }));
cmsRoutes.get('/dashboard', requireAuth, requireAdmin, asyncHandler(cmsController.dashboard));
cmsRoutes.get('/availability', availabilityQuery, asyncHandler(availabilityController.availability));
cmsRoutes.get('/vehicles/:id/calendar', idParam, calendarQuery, asyncHandler(availabilityController.calendar));
cmsRoutes.get('/bookings', requireAuth, requireAdmin, bookingsQuery, asyncHandler(availabilityController.listBookings));
cmsRoutes.get('/bookings/:id', requireAuth, requireAdmin, idParam, asyncHandler(availabilityController.getBooking));
cmsRoutes.post('/bookings', requireAuth, requireAdmin, bookingPayload, asyncHandler(availabilityController.createBooking));
cmsRoutes.put('/bookings/:id', requireAuth, requireAdmin, idParam, bookingPayload, asyncHandler(availabilityController.updateBooking));
cmsRoutes.delete('/bookings/:id', requireAuth, requireAdmin, idParam, asyncHandler(availabilityController.deleteBooking));
cmsRoutes.post('/bookings/:id/returned', requireAuth, requireAdmin, idParam, asyncHandler(availabilityController.markReturned));
cmsRoutes.post('/bookings/:id/cancelled', requireAuth, requireAdmin, idParam, asyncHandler(availabilityController.markCancelled));
cmsRoutes.get('/maintenance', requireAuth, requireAdmin, maintenanceQuery, asyncHandler(maintenanceController.list));
cmsRoutes.get('/maintenance/:id', requireAuth, requireAdmin, idParam, asyncHandler(maintenanceController.get));
cmsRoutes.post('/maintenance', requireAuth, requireAdmin, maintenancePayload, asyncHandler(maintenanceController.create));
cmsRoutes.put('/maintenance/:id', requireAuth, requireAdmin, idParam, maintenancePayload, asyncHandler(maintenanceController.update));
cmsRoutes.delete('/maintenance/:id', requireAuth, requireAdmin, idParam, asyncHandler(maintenanceController.delete));
cmsRoutes.get('/business/reports/summary', requireAuth, requireAdmin, asyncHandler(businessOperationsController.reportSummary));
cmsRoutes.get('/business/customers/summary', requireAuth, requireAdmin, asyncHandler(businessOperationsController.customerSummary));
cmsRoutes.get('/business/customers', requireAuth, requireAdmin, listQuery, asyncHandler(businessOperationsController.customers));
cmsRoutes.get('/business/customers/:id', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.customer));
cmsRoutes.post('/business/customers', requireAuth, requireAdmin, customerPayload, asyncHandler(businessOperationsController.createCustomer));
cmsRoutes.put('/business/customers/:id', requireAuth, requireAdmin, idParam, customerPayload, asyncHandler(businessOperationsController.updateCustomer));
cmsRoutes.delete('/business/customers/:id', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.deleteCustomer));
cmsRoutes.get('/business/customers/:id/notes', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.customerNotes));
cmsRoutes.get('/business/customers/:id/history', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.customerHistory));
cmsRoutes.post('/business/customers/:id/notes', requireAuth, requireAdmin, idParam, customerNotePayload, asyncHandler(businessOperationsController.createCustomerNote));
cmsRoutes.get('/business/contracts', requireAuth, requireAdmin, listQuery, asyncHandler(businessOperationsController.contracts));
cmsRoutes.get('/business/contracts/:id', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.contract));
cmsRoutes.post('/business/contracts', requireAuth, requireAdmin, contractPayload, asyncHandler(businessOperationsController.createContract));
cmsRoutes.put('/business/contracts/:id', requireAuth, requireAdmin, idParam, contractPayload, asyncHandler(businessOperationsController.updateContract));
cmsRoutes.delete('/business/contracts/:id', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.deleteContract));
cmsRoutes.post('/business/contracts/:id/attachments', requireAuth, requireAdmin, idParam, attachmentPayload, asyncHandler(businessOperationsController.createAttachment));
cmsRoutes.get('/business/expenses/summary', requireAuth, requireAdmin, asyncHandler(businessOperationsController.expenseSummary));
cmsRoutes.get('/business/expenses', requireAuth, requireAdmin, listQuery, asyncHandler(businessOperationsController.expenses));
cmsRoutes.get('/business/expenses/:id', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.expense));
cmsRoutes.post('/business/expenses', requireAuth, requireAdmin, expensePayload, asyncHandler(businessOperationsController.createExpense));
cmsRoutes.put('/business/expenses/:id', requireAuth, requireAdmin, idParam, expensePayload, asyncHandler(businessOperationsController.updateExpense));
cmsRoutes.delete('/business/expenses/:id', requireAuth, requireAdmin, idParam, asyncHandler(businessOperationsController.deleteExpense));
cmsRoutes.get('/operations/health', requireAuth, requireAdmin, asyncHandler(operationsController.health));
cmsRoutes.get('/operations/audit-logs', requireAuth, requireAdmin, asyncHandler(operationsController.auditLogs));
cmsRoutes.get('/operations/backups', requireAuth, requireAdmin, asyncHandler(operationsController.backups));
cmsRoutes.post('/operations/backups', requireAuth, requireAdmin, asyncHandler(operationsController.createBackup));
cmsRoutes.get('/operations/backups/:id/download', requireAuth, requireAdmin, idParam, asyncHandler(operationsController.downloadBackup));
cmsRoutes.get('/operations/profile', requireAuth, requireAdmin, asyncHandler(operationsController.profile));
cmsRoutes.put('/operations/profile', requireAuth, requireAdmin, profilePayload, asyncHandler(operationsController.updateProfile));
cmsRoutes.post('/operations/password', requireAuth, requireAdmin, passwordPayload, asyncHandler(operationsController.changePassword));
cmsRoutes.get('/operations/sessions', requireAuth, requireAdmin, asyncHandler(operationsController.sessions));
cmsRoutes.post('/operations/sessions/:id/revoke', requireAuth, requireAdmin, idParam, asyncHandler(operationsController.revokeSession));

cmsRoutes.get('/cars', asyncHandler(cmsController.listCars));
cmsRoutes.get('/cars/:slug', slugParam, asyncHandler(cmsController.getCar));
cmsRoutes.post('/cars', requireAuth, requireAdmin, carPayload, asyncHandler(cmsController.createCar));
cmsRoutes.put('/cars/:id', requireAuth, requireAdmin, idParam, carPayload, asyncHandler(cmsController.updateCar));
cmsRoutes.delete('/cars/:id', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.deleteCar));
cmsRoutes.post('/cars/:id/cover-image', requireAuth, requireAdmin, idParam, upload.single('file'), validateImageUpload, asyncHandler(cmsController.uploadCarCover));
cmsRoutes.post('/cars/:id/gallery-images', requireAuth, requireAdmin, idParam, upload.single('file'), validateImageUpload, asyncHandler(cmsController.uploadCarGallery));
cmsRoutes.put('/cars/:id/gallery-images/order', requireAuth, requireAdmin, idParam, galleryOrderPayload, asyncHandler(cmsController.reorderCarGallery));
cmsRoutes.put('/car-images/:id', requireAuth, requireAdmin, idParam, upload.single('file'), validateImageUpload, asyncHandler(cmsController.replaceCarImage));
cmsRoutes.delete('/car-images/:id', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.deleteCarImage));

cmsRoutes.get('/faqs', asyncHandler(cmsController.listFaqs));
cmsRoutes.get('/faq-categories', asyncHandler(cmsController.listFaqCategories));
cmsRoutes.post('/faqs', requireAuth, requireAdmin, faqPayload, asyncHandler(cmsController.createFaq));
cmsRoutes.put('/faqs/:id', requireAuth, requireAdmin, idParam, faqPayload, asyncHandler(cmsController.updateFaq));
cmsRoutes.delete('/faqs/:id', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.deleteFaq));

cmsRoutes.get('/settings', optionalAuth, asyncHandler(cmsController.listSettings));
cmsRoutes.put('/settings/:key', requireAuth, requireAdmin, [param('key').isString().trim().isLength({ min: 1, max: 120 }), body('value').exists(), validate], asyncHandler(cmsController.updateSetting));
cmsRoutes.post('/settings/:key/image', requireAuth, requireAdmin, [param('key').isString().trim().isLength({ min: 1, max: 120 }), validate], upload.single('file'), validateImageUpload, imageFieldPayload, asyncHandler(cmsController.uploadSettingImage));

cmsRoutes.get('/pages', optionalAuth, asyncHandler(cmsController.listPages));
cmsRoutes.get('/pages/:slug', optionalAuth, [param('slug').isString().trim().isLength({ min: 1, max: 190 }), validate], asyncHandler(cmsController.getPage));
cmsRoutes.post('/pages', requireAuth, requireAdmin, pagePayload, asyncHandler(cmsController.createPage));
cmsRoutes.put('/pages/:id', requireAuth, requireAdmin, idParam, pagePayload, asyncHandler(cmsController.updatePage));
cmsRoutes.patch('/pages/:id/status', requireAuth, requireAdmin, idParam, pageStatusPayload, asyncHandler(cmsController.updatePageStatus));
cmsRoutes.post('/pages/:id/duplicate', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.duplicatePage));
cmsRoutes.delete('/pages/:id', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.deletePage));
cmsRoutes.post('/pages/:id/image', requireAuth, requireAdmin, idParam, upload.single('file'), validateImageUpload, imageFieldPayload, asyncHandler(cmsController.uploadPageImage));

cmsRoutes.get('/rental-conditions', asyncHandler(cmsController.listRentalConditions));
cmsRoutes.post('/rental-conditions', requireAuth, requireAdmin, rentalConditionPayload, asyncHandler(cmsController.createRentalCondition));
cmsRoutes.put('/rental-conditions/:id', requireAuth, requireAdmin, idParam, rentalConditionPayload, asyncHandler(cmsController.updateRentalCondition));
cmsRoutes.delete('/rental-conditions/:id', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.deleteRentalCondition));

cmsRoutes.get('/reviews', asyncHandler(cmsController.listReviews));
cmsRoutes.post('/reviews', requireAuth, requireAdmin, reviewPayload, asyncHandler(cmsController.createReview));
cmsRoutes.put('/reviews/:id', requireAuth, requireAdmin, idParam, reviewPayload, asyncHandler(cmsController.updateReview));
cmsRoutes.post('/reviews/:id/image', requireAuth, requireAdmin, idParam, upload.single('file'), validateImageUpload, asyncHandler(cmsController.uploadReviewImage));
cmsRoutes.delete('/reviews/:id', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.deleteReview));

cmsRoutes.get('/uploads', requireAuth, requireAdmin, asyncHandler(cmsController.listUploads));
cmsRoutes.post('/uploads', requireAuth, requireAdmin, upload.single('file'), validateImageUpload, asyncHandler(cmsController.uploadFile));
cmsRoutes.put('/uploads/:id', requireAuth, requireAdmin, idParam, upload.single('file'), validateImageUpload, asyncHandler(cmsController.replaceUpload));
cmsRoutes.delete('/uploads/:id', requireAuth, requireAdmin, idParam, asyncHandler(cmsController.deleteUpload));
