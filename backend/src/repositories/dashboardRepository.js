import { pool } from '../db/pool.js';

function normalizeDate(value) {
  if (value instanceof Date) {
    const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }
  return String(value || '').slice(0, 10);
}

export const dashboardRepository = {
  async getSummary() {
    const today = new Date().toISOString().slice(0, 10);
    const [
      [cars],
      [faqs],
      [reviews],
      [pages],
      [settings],
      [bookedToday],
      [maintenanceToday],
      [returningToday],
      [fleetTrend],
      [customerStats],
      [revenueStats],
      [vehicleRevenue],
      [expenseStats],
      [vehicleExpenses],
      [mostUsedVehicles],
      [leastUsedVehicles],
      [topCustomers],
      [monthlyTrends],
      [yearlyTrends]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM cars'),
      pool.query('SELECT COUNT(*) AS total FROM faqs'),
      pool.query('SELECT COUNT(*) AS total FROM reviews'),
      pool.query('SELECT COUNT(*) AS total FROM pages'),
      pool.query('SELECT COUNT(*) AS total FROM site_settings'),
      pool.query("SELECT COUNT(DISTINCT vehicle_id) AS total FROM vehicle_bookings WHERE status IN ('reserved', 'active') AND start_date <= ? AND end_date >= ?", [today, today]),
      pool.query(
        `SELECT COUNT(DISTINCT vehicle_id) AS total
         FROM (
           SELECT vehicle_id FROM vehicle_bookings
           WHERE status = 'maintenance' AND start_date <= ? AND end_date >= ?
           UNION
           SELECT vehicle_id FROM vehicle_maintenance
           WHERE status = 'maintenance' AND start_date <= ? AND end_date >= ?
         ) AS maintenance_vehicles`,
        [today, today, today, today]
      ),
      pool.query("SELECT COUNT(*) AS total FROM vehicle_bookings WHERE status IN ('reserved', 'active') AND end_date = ?", [today]),
      pool.query(
        `WITH days AS (
          SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '6 days', INTERVAL '1 day')::date AS day
        ),
        booking_counts AS (
          SELECT days.day, COUNT(DISTINCT vehicle_bookings.vehicle_id) AS booked
          FROM days
          LEFT JOIN vehicle_bookings
            ON vehicle_bookings.status IN ('reserved', 'active')
            AND vehicle_bookings.start_date <= days.day
            AND vehicle_bookings.end_date >= days.day
          GROUP BY days.day
        ),
        maintenance_counts AS (
          SELECT days.day, COUNT(DISTINCT blocks.vehicle_id) AS maintenance
          FROM days
          LEFT JOIN (
            SELECT vehicle_id, start_date, end_date
            FROM vehicle_bookings
            WHERE status = 'maintenance'
            UNION ALL
            SELECT vehicle_id, start_date, end_date
            FROM vehicle_maintenance
            WHERE status = 'maintenance'
          ) AS blocks
            ON blocks.start_date <= days.day
            AND blocks.end_date >= days.day
          GROUP BY days.day
        )
        SELECT
          days.day,
          COALESCE(booking_counts.booked, 0) AS booked,
          COALESCE(maintenance_counts.maintenance, 0) AS maintenance
        FROM days
        LEFT JOIN booking_counts ON booking_counts.day = days.day
        LEFT JOIN maintenance_counts ON maintenance_counts.day = days.day
        ORDER BY days.day`
      ),
      pool.query(
        `SELECT
          COUNT(*) AS customers_count,
          COUNT(*) FILTER (WHERE rental_count >= 2) AS repeat_customers_count,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS recent_customers_count
         FROM customers`
      ),
      pool.query(
        `SELECT
          COALESCE(SUM(revenue_amount) FILTER (WHERE start_date = CURRENT_DATE), 0) AS today_revenue,
          COALESCE(SUM(revenue_amount) FILTER (
            WHERE start_date >= date_trunc('month', CURRENT_DATE)::date
              AND start_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
          ), 0) AS monthly_revenue,
          COALESCE(SUM(revenue_amount) FILTER (
            WHERE start_date >= date_trunc('year', CURRENT_DATE)::date
              AND start_date < (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year')::date
          ), 0) AS yearly_revenue
         FROM vehicle_bookings
         WHERE status IN ('reserved', 'active', 'returned')`
      ),
      pool.query(
        `SELECT *
         FROM booking_vehicle_revenue
         ORDER BY revenue DESC, bookings_count DESC
         LIMIT 6`
      ),
      pool.query(
        `SELECT
          COALESCE(SUM(amount) FILTER (WHERE expense_date = CURRENT_DATE), 0) AS today_expenses,
          COALESCE(SUM(amount) FILTER (
            WHERE expense_date >= date_trunc('month', CURRENT_DATE)::date
              AND expense_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
          ), 0) AS monthly_expenses,
          COALESCE(SUM(amount) FILTER (
            WHERE expense_date >= date_trunc('year', CURRENT_DATE)::date
              AND expense_date < (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year')::date
          ), 0) AS yearly_expenses
         FROM vehicle_expenses`
      ),
      pool.query(
        `SELECT *
         FROM expense_vehicle_summary
         ORDER BY expenses DESC, expenses_count DESC
         LIMIT 6`
      ),
      pool.query(
        `SELECT
          cars.id AS vehicle_id,
          cars.name AS vehicle_name,
          COUNT(vehicle_bookings.id) AS bookings_count,
          COALESCE(SUM(GREATEST((vehicle_bookings.end_date - vehicle_bookings.start_date) + 1, 1)), 0) AS rental_days
         FROM cars
         LEFT JOIN vehicle_bookings
           ON vehicle_bookings.vehicle_id = cars.id
           AND vehicle_bookings.status IN ('reserved', 'active', 'returned')
         GROUP BY cars.id, cars.name
         ORDER BY rental_days DESC, bookings_count DESC, cars.name ASC
         LIMIT 6`
      ),
      pool.query(
        `SELECT
          cars.id AS vehicle_id,
          cars.name AS vehicle_name,
          COUNT(vehicle_bookings.id) AS bookings_count,
          COALESCE(SUM(GREATEST((vehicle_bookings.end_date - vehicle_bookings.start_date) + 1, 1)), 0) AS rental_days
         FROM cars
         LEFT JOIN vehicle_bookings
           ON vehicle_bookings.vehicle_id = cars.id
           AND vehicle_bookings.status IN ('reserved', 'active', 'returned')
         GROUP BY cars.id, cars.name
         ORDER BY rental_days ASC, bookings_count ASC, cars.name ASC
         LIMIT 6`
      ),
      pool.query(
        `WITH booking_revenue AS (
          SELECT customer_id, SUM(revenue_amount) AS revenue
          FROM vehicle_bookings
          WHERE customer_id IS NOT NULL
            AND status IN ('reserved', 'active', 'returned')
          GROUP BY customer_id
        ),
        contract_revenue AS (
          SELECT customer_id, SUM(total_amount) AS revenue
          FROM contracts
          WHERE status IN ('active', 'completed')
          GROUP BY customer_id
        )
        SELECT
          customers.id,
          customers.name,
          customers.phone,
          customers.rental_count,
          customers.last_rental_date,
          COALESCE(booking_revenue.revenue, 0) + COALESCE(contract_revenue.revenue, 0) AS revenue
        FROM customers
        LEFT JOIN booking_revenue ON booking_revenue.customer_id = customers.id
        LEFT JOIN contract_revenue ON contract_revenue.customer_id = customers.id
        ORDER BY revenue DESC, customers.rental_count DESC, customers.last_rental_date DESC NULLS LAST
        LIMIT 6`
      ),
      pool.query(
        `WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE)::date - INTERVAL '11 months',
            date_trunc('month', CURRENT_DATE)::date,
            INTERVAL '1 month'
          )::date AS period
        ),
        revenue AS (
          SELECT date_trunc('month', start_date)::date AS period, SUM(revenue_amount) AS revenue
          FROM vehicle_bookings
          WHERE status IN ('reserved', 'active', 'returned')
          GROUP BY date_trunc('month', start_date)::date
        ),
        expenses AS (
          SELECT date_trunc('month', expense_date)::date AS period, SUM(amount) AS expenses
          FROM vehicle_expenses
          GROUP BY date_trunc('month', expense_date)::date
        )
        SELECT
          months.period,
          COALESCE(revenue.revenue, 0) AS revenue,
          COALESCE(expenses.expenses, 0) AS expenses,
          COALESCE(revenue.revenue, 0) - COALESCE(expenses.expenses, 0) AS profit
        FROM months
        LEFT JOIN revenue ON revenue.period = months.period
        LEFT JOIN expenses ON expenses.period = months.period
        ORDER BY months.period ASC`
      ),
      pool.query(
        `WITH years AS (
          SELECT generate_series(
            date_trunc('year', CURRENT_DATE)::date - INTERVAL '4 years',
            date_trunc('year', CURRENT_DATE)::date,
            INTERVAL '1 year'
          )::date AS period
        ),
        revenue AS (
          SELECT date_trunc('year', start_date)::date AS period, SUM(revenue_amount) AS revenue
          FROM vehicle_bookings
          WHERE status IN ('reserved', 'active', 'returned')
          GROUP BY date_trunc('year', start_date)::date
        ),
        expenses AS (
          SELECT date_trunc('year', expense_date)::date AS period, SUM(amount) AS expenses
          FROM vehicle_expenses
          GROUP BY date_trunc('year', expense_date)::date
        )
        SELECT
          years.period,
          COALESCE(revenue.revenue, 0) AS revenue,
          COALESCE(expenses.expenses, 0) AS expenses,
          COALESCE(revenue.revenue, 0) - COALESCE(expenses.expenses, 0) AS profit
        FROM years
        LEFT JOIN revenue ON revenue.period = years.period
        LEFT JOIN expenses ON expenses.period = years.period
        ORDER BY years.period ASC`
      )
    ]);
    const carsCount = Number(cars[0]?.total || 0);
    const bookedTodayCount = Number(bookedToday[0]?.total || 0);
    const maintenanceTodayCount = Number(maintenanceToday[0]?.total || 0);
    const unavailableTodayCount = Math.min(bookedTodayCount + maintenanceTodayCount, carsCount);
    const occupancyRate = carsCount > 0 ? Math.round((unavailableTodayCount / carsCount) * 100) : 0;
    const utilizationRate = carsCount > 0 ? Math.round((bookedTodayCount / carsCount) * 100) : 0;

    return {
      carsCount,
      availableTodayCount: Math.max(carsCount - unavailableTodayCount, 0),
      bookedTodayCount,
      maintenanceTodayCount,
      returningTodayCount: Number(returningToday[0]?.total || 0),
      occupancyRate,
      utilizationRate,
      fleetTrend: fleetTrend.map((row) => {
        const booked = Number(row.booked || 0);
        const maintenance = Number(row.maintenance || 0);
        const unavailable = Math.min(booked + maintenance, carsCount);
        return {
          date: normalizeDate(row.day),
          total: carsCount,
          booked,
          maintenance,
          available: Math.max(carsCount - unavailable, 0),
          occupancyRate: carsCount > 0 ? Math.round((unavailable / carsCount) * 100) : 0,
          utilizationRate: carsCount > 0 ? Math.round((booked / carsCount) * 100) : 0
        };
      }),
      faqCount: Number(faqs[0]?.total || 0),
      reviewsCount: Number(reviews[0]?.total || 0),
      pagesCount: Number(pages[0]?.total || 0),
      siteSettingsCount: Number(settings[0]?.total || 0),
      customersCount: Number(customerStats[0]?.customers_count || 0),
      repeatCustomersCount: Number(customerStats[0]?.repeat_customers_count || 0),
      recentCustomersCount: Number(customerStats[0]?.recent_customers_count || 0),
      todayRevenue: Number(revenueStats[0]?.today_revenue || 0),
      monthlyRevenue: Number(revenueStats[0]?.monthly_revenue || 0),
      yearlyRevenue: Number(revenueStats[0]?.yearly_revenue || 0),
      vehicleRevenue: vehicleRevenue.map((row) => ({
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        revenue: Number(row.revenue || 0),
        bookingsCount: Number(row.bookings_count || 0)
      })),
      todayExpenses: Number(expenseStats[0]?.today_expenses || 0),
      monthlyExpenses: Number(expenseStats[0]?.monthly_expenses || 0),
      yearlyExpenses: Number(expenseStats[0]?.yearly_expenses || 0),
      todayProfit: Number(revenueStats[0]?.today_revenue || 0) - Number(expenseStats[0]?.today_expenses || 0),
      monthlyProfit: Number(revenueStats[0]?.monthly_revenue || 0) - Number(expenseStats[0]?.monthly_expenses || 0),
      yearlyProfit: Number(revenueStats[0]?.yearly_revenue || 0) - Number(expenseStats[0]?.yearly_expenses || 0),
      expensesPerVehicle: vehicleExpenses.map((row) => ({
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        expenses: Number(row.expenses || 0),
        expensesCount: Number(row.expenses_count || 0)
      })),
      mostUsedVehicles: mostUsedVehicles.map((row) => ({
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        bookingsCount: Number(row.bookings_count || 0),
        rentalDays: Number(row.rental_days || 0)
      })),
      leastUsedVehicles: leastUsedVehicles.map((row) => ({
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        bookingsCount: Number(row.bookings_count || 0),
        rentalDays: Number(row.rental_days || 0)
      })),
      topCustomers: topCustomers.map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        rentalCount: Number(row.rental_count || 0),
        lastRentalDate: normalizeDate(row.last_rental_date),
        revenue: Number(row.revenue || 0)
      })),
      monthlyTrends: monthlyTrends.map((row) => ({
        period: normalizeDate(row.period),
        revenue: Number(row.revenue || 0),
        expenses: Number(row.expenses || 0),
        profit: Number(row.profit || 0)
      })),
      yearlyTrends: yearlyTrends.map((row) => ({
        period: normalizeDate(row.period),
        revenue: Number(row.revenue || 0),
        expenses: Number(row.expenses || 0),
        profit: Number(row.profit || 0)
      }))
    };
  }
};
