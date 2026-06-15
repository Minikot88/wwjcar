import { clearAdminToken, setAdminToken } from './apiClient.js';

const STORAGE_KEY = 'wwj_mock_cms_v1';
const MOCK_ADMIN = {
  email: 'admin@wwjcarrent.local',
  password: 'ChangeMe123!',
  name: 'WWJ Admin',
  role: 'admin'
};

let cachedSeed = null;
let cachedInitialState = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function loadSeedData() {
  if (cachedSeed) return cachedSeed;

  const [{ default: cmsSeed }, { cars: staticCars }, { faqItems }] = await Promise.all([
    import('../data/cms/cmsSeed.json'),
    import('../data/cars.js'),
    import('../data/faqs.js')
  ]);

  cachedSeed = { cmsSeed, staticCars, faqItems };
  return cachedSeed;
}

async function createInitialState() {
  if (cachedInitialState) return clone(cachedInitialState);

  const { cmsSeed, staticCars, faqItems } = await loadSeedData();
  cachedInitialState = {
    cars: staticCars.map((car, index) => ({
      ...car,
      id: index + 1,
      coverImage: car.image,
      description: `${car.name} รถเช่าหาดใหญ่สำหรับเดินทางในเมือง สนามบิน และจังหวัดใกล้เคียง`,
      featured: index < 6,
      airportPickup: true,
      monthlyRental: car.categories?.some((category) => category.includes('รายเดือน')) || false,
      status: 'published'
    })),
    faqs: faqItems.map((item, index) => ({
      id: index + 1,
      categoryId: guessFaqCategoryId(item.question, item.answer),
      question: item.question,
      answer: item.answer,
      sortOrder: index + 1,
      status: 'published'
    })),
    faqCategories: cmsSeed.faqCategories,
    settings: cmsSeed.settings,
    pages: cmsSeed.pages,
    rentalConditions: cmsSeed.rentalConditions,
    reviews: cmsSeed.reviews,
    uploads: cmsSeed.uploads
  };

  return clone(cachedInitialState);
}

function guessFaqCategoryId(question, answer) {
  const text = `${question} ${answer}`;
  if (text.includes('เอกสาร') || text.includes('ใบขับขี่') || text.includes('พาสปอร์ต')) return 2;
  if (text.includes('รับรถ') || text.includes('สนามบิน')) return 3;
  if (text.includes('คืนรถ') || text.includes('น้ำมัน')) return 4;
  if (text.includes('ประกัน') || text.includes('อุบัติเหตุ')) return 5;
  if (text.includes('ต่างชาติ') || text.includes('มาเลเซีย') || text.includes('WhatsApp')) return 6;
  if (text.includes('เบตง') || text.includes('ปากบารา') || text.includes('ข้ามจังหวัด')) return 7;
  return 1;
}

async function readState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const initialState = await createInitialState();

  if (!saved) {
    writeState(initialState);
    return initialState;
  }

  try {
    return {
      ...initialState,
      ...JSON.parse(saved)
    };
  } catch {
    writeState(initialState);
    return initialState;
  }
}

function writeState(nextState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent('wwj:mock-cms-updated'));
}

function resolveFast(value) {
  return Promise.resolve(clone(value));
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

async function mutate(collection, action) {
  const state = await readState();
  const result = action(state[collection], state);
  writeState(state);
  return resolveFast(result);
}

function publicItems(items) {
  return items.filter((item) => item.status !== 'draft');
}

export const cmsService = {
  login: async (credentials) => {
    if (credentials.email !== MOCK_ADMIN.email || credentials.password !== MOCK_ADMIN.password) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const token = `mock-admin-token-${Date.now()}`;
    setAdminToken(token);
    return resolveFast({
      token,
      user: {
        name: MOCK_ADMIN.name,
        email: MOCK_ADMIN.email,
        role: MOCK_ADMIN.role
      }
    });
  },
  logout: () => clearAdminToken(),
  getDashboard: async () => {
    const state = await readState();
    return resolveFast({
      carsCount: state.cars.length,
      faqCount: state.faqs.length,
      reviewsCount: state.reviews.length,
      pagesCount: state.pages.length,
      siteSettingsCount: state.settings.length
    });
  },
  getCars: async (includeDrafts = false) => {
    const cars = (await readState()).cars;
    return resolveFast(includeDrafts ? cars : publicItems(cars));
  },
  getCar: async (slug) => {
    const car = (await readState()).cars.find((item) => item.slug === slug);
    return resolveFast(car || null);
  },
  createCar: (payload) =>
    mutate('cars', (items) => {
      const created = { ...payload, id: nextId(items), image: payload.coverImage || payload.image, status: payload.status || 'published' };
      items.push(created);
      return created;
    }),
  updateCar: (id, payload) =>
    mutate('cars', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index === -1) throw new Error('ไม่พบข้อมูลรถ');
      items[index] = { ...items[index], ...payload, image: payload.coverImage || payload.image || items[index].image };
      return items[index];
    }),
  deleteCar: (id) =>
    mutate('cars', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) items.splice(index, 1);
      return null;
    }),
  getFaqs: async (includeDrafts = false) => {
    const state = await readState();
    const faqs = (includeDrafts ? state.faqs : publicItems(state.faqs)).map((faq) => {
      const category = state.faqCategories.find((item) => item.id === Number(faq.categoryId));
      return {
        ...faq,
        categoryName: category?.name,
        categorySlug: category?.slug
      };
    });
    return resolveFast(faqs.sort((a, b) => a.sortOrder - b.sortOrder));
  },
  createFaq: (payload) =>
    mutate('faqs', (items) => {
      const created = { ...payload, id: nextId(items), status: payload.status || 'published' };
      items.push(created);
      return created;
    }),
  updateFaq: (id, payload) =>
    mutate('faqs', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index === -1) throw new Error('ไม่พบ FAQ');
      items[index] = { ...items[index], ...payload };
      return items[index];
    }),
  deleteFaq: (id) =>
    mutate('faqs', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) items.splice(index, 1);
      return null;
    }),
  getFaqCategories: async () => resolveFast((await readState()).faqCategories),
  getSettings: async () => resolveFast((await readState()).settings),
  updateSetting: (key, value) =>
    mutate('settings', (items) => {
      const index = items.findIndex((item) => item.key === key);
      const nextItem = { key, value };
      if (index === -1) items.push(nextItem);
      else items[index] = nextItem;
      return nextItem;
    }),
  getPages: async (includeDrafts = false) => {
    const pages = (await readState()).pages;
    return resolveFast(includeDrafts ? pages : publicItems(pages));
  },
  createPage: (payload) =>
    mutate('pages', (items) => {
      const created = { ...payload, id: nextId(items), status: payload.status || 'published' };
      items.push(created);
      return created;
    }),
  updatePage: (id, payload) =>
    mutate('pages', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index === -1) throw new Error('ไม่พบหน้าเว็บ');
      items[index] = { ...items[index], ...payload };
      return items[index];
    }),
  deletePage: (id) =>
    mutate('pages', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) items.splice(index, 1);
      return null;
    }),
  getRentalConditions: async () => {
    const rentalConditions = (await readState()).rentalConditions;
    return resolveFast(rentalConditions.sort((a, b) => a.sortOrder - b.sortOrder));
  },
  createRentalCondition: (payload) =>
    mutate('rentalConditions', (items) => {
      const created = { ...payload, id: nextId(items) };
      items.push(created);
      return created;
    }),
  updateRentalCondition: (id, payload) =>
    mutate('rentalConditions', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index === -1) throw new Error('ไม่พบเงื่อนไข');
      items[index] = { ...items[index], ...payload };
      return items[index];
    }),
  deleteRentalCondition: (id) =>
    mutate('rentalConditions', (items) => {
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) items.splice(index, 1);
      return null;
    }),
  getUploads: async () => resolveFast((await readState()).uploads),
  uploadFile: (file, usageType = 'general') =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        mutate('uploads', (items) => {
          const created = {
            id: nextId(items),
            originalName: file.name,
            fileName: file.name,
            fileUrl: reader.result,
            mimeType: file.type,
            sizeBytes: file.size,
            usageType,
            createdAt: new Date().toISOString()
          };
          items.unshift(created);
          return created;
        }).then(resolve);
      };
      reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'));
      reader.readAsDataURL(file);
    })
};
