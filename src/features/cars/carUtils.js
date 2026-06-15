import { cars } from '../../data/cars.js';

export const sortOptions = [
  {
    value: 'price-asc',
    label: 'ราคาต่ำไปสูง'
  },
  {
    value: 'price-desc',
    label: 'ราคาสูงไปต่ำ'
  }
];

export const categoryOptions = ['รถประหยัด', 'รถครอบครัว', 'รถยอดนิยม', 'รถเช่ารายเดือน'];

export function getTransmissionLabel(transmission) {
  return transmission === 'Automatic' ? 'เกียร์อัตโนมัติ' : transmission;
}

export function getFuelLabel(fuel) {
  return fuel === 'Petrol' ? 'เบนซิน' : fuel;
}

export function getCarBySlug(slug) {
  return cars.find((car) => car.slug === slug);
}

export function getBrands() {
  return [...new Set(cars.map((car) => car.brand))].sort();
}

export function getTransmissions() {
  return [...new Set(cars.map((car) => car.transmission))].sort();
}

export function filterCars(carList, filters) {
  const search = filters.search.trim().toLowerCase();

  return carList
    .filter((car) => {
      const matchesSearch = search
        ? `${car.name} ${car.brand}`.toLowerCase().includes(search)
        : true;
      const matchesCategory = filters.category ? car.categories?.includes(filters.category) : true;
      const matchesBrand = filters.brand ? car.brand === filters.brand : true;
      const matchesTransmission = filters.transmission ? car.transmission === filters.transmission : true;

      return matchesSearch && matchesCategory && matchesBrand && matchesTransmission;
    })
    .sort((a, b) => {
      if (filters.sort === 'price-desc') {
        return b.pricePerDay - a.pricePerDay;
      }

      return a.pricePerDay - b.pricePerDay;
    });
}

export function getRelatedCars(currentCar, limit = 3) {
  if (!currentCar) {
    return [];
  }

  const sameBrand = cars.filter((car) => car.brand === currentCar.brand && car.id !== currentCar.id);
  const otherCars = cars.filter((car) => car.brand !== currentCar.brand && car.id !== currentCar.id);

  return [...sameBrand, ...otherCars].slice(0, limit);
}
