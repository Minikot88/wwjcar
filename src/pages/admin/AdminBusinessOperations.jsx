import { Box, Button, Chip, Drawer, IconButton, Stack, Tab, Tabs, TextField, Typography, Alert } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';

const money = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const emptyCustomer = { name: '', phone: '', email: '', address: '', note: '' };
const emptyExpense = { vehicleId: '', category: 'other', amount: 0, expenseDate: new Date().toISOString().slice(0, 10), note: '' };
const expenseLabels = { fuel: 'น้ำมัน', maintenance: 'ซ่อมบำรุง', insurance: 'ประกันภัย', cleaning: 'ล้างรถ', other: 'อื่น ๆ' };

function asArray(data) { return Array.isArray(data) ? data : data?.items || []; }
function formatDate(value) { if (!value) return '-'; return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value)); }
function formatMoney(value) { return money.format(Number(value || 0)); }
function getVehicleName(cars, id) { return cars.find((car) => Number(car.id) === Number(id))?.name || 'ไม่ระบุรถ'; }
function getCustomerName(customers, id) { return customers.find((customer) => Number(customer.id) === Number(id))?.name || 'ไม่ระบุลูกค้า'; }

function Metric({ label, value, helper, color = colors.primary }) {
  return <Stack sx={{ bgcolor: 'background.paper', borderRadius: '24px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', p: 2.5 }}><Typography color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 850 }}>{label}</Typography><Typography sx={{ color, fontSize: '1.55rem', fontWeight: 950, mt: 0.65 }}>{value}</Typography>{helper ? <Typography color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.4 }}>{helper}</Typography> : null}</Stack>;
}

function BarChart({ title, rows, fields }) {
  const max = Math.max(...rows.flatMap((row) => fields.map((field) => Math.abs(Number(row[field.key] || 0)))), 1);
  return (
    <Stack spacing={2} sx={{ bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 16px 42px rgba(15,17,21,0.045)', p: { xs: 2.25, md: 3 } }}>
      <Typography sx={{ fontSize: '1.15rem', fontWeight: 950 }}>{title}</Typography>
      {!rows.length ? <AdminEmptyState label="ยังไม่มีข้อมูลสำหรับแสดงกราฟ" /> : rows.slice(-6).map((row) => (
        <Stack key={row.period || row.month || row.label} spacing={1}>
          <Typography color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 900 }}>{row.period || row.month || row.label}</Typography>
          {fields.map((field) => {
            const value = Number(row[field.key] || 0);
            return <Box key={field.key} sx={{ display: 'grid', gap: 1, gridTemplateColumns: '72px 1fr 96px', alignItems: 'center' }}><Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>{field.label}</Typography><Box sx={{ bgcolor: 'rgba(107,114,128,0.12)', borderRadius: 99, height: 10, overflow: 'hidden' }}><Box sx={{ bgcolor: field.color, height: '100%', width: `${Math.max((Math.abs(value) / max) * 100, value ? 4 : 0)}%` }} /></Box><Typography color="text.secondary" sx={{ fontSize: '0.76rem', textAlign: 'right' }}>{formatMoney(value)}</Typography></Box>;
          })}
        </Stack>
      ))}
    </Stack>
  );
}

function CustomerCard({ customer, onClick }) {
  return <Stack spacing={1.25} onClick={onClick} sx={{ bgcolor: 'background.paper', borderRadius: '24px', boxShadow: '0 14px 36px rgba(15,17,21,0.04)', cursor: 'pointer', p: 2.25 }}><Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}><Typography sx={{ fontWeight: 950 }} noWrap>{customer.name || 'ลูกค้า'}</Typography><Chip size="small" label={`${customer.rentalCount || 0} ครั้ง`} sx={{ fontWeight: 900 }} /></Stack><Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>{customer.phone || '-'} · เช่าล่าสุด {formatDate(customer.lastRentalDate || customer.last_rental_date)}</Typography>{customer.note ? <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>{customer.note}</Typography> : null}</Stack>;
}

function DrawerShell({ open, title, children, onClose }) {
  return <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100vw', sm: 560 }, maxWidth: '100vw' } }}><Stack><Stack direction="row" spacing={2} sx={{ alignItems: 'center', borderBottom: `1px solid ${colors.hairlineSoft}`, p: 3 }}><Typography sx={{ flex: 1, fontSize: '1.35rem', fontWeight: 950 }}>{title}</Typography><IconButton aria-label="ปิด" onClick={onClose}><CloseOutlinedIcon /></IconButton></Stack><Stack spacing={2.25} sx={{ p: 3 }}>{children}</Stack></Stack></Drawer>;
}

export default function AdminBusinessOperations() {
  const [tab, setTab] = useState('customers');
  const action = useAdminAction();
  const { data: report, isLoading, error } = useCmsResource(() => cmsService.getBusinessReport(), null, []);
  const { data: carsData = [] } = useCmsResource(() => cmsService.getCars(true), [], []);
  const { data: customersData = [] } = useCmsResource(() => cmsService.getCustomers({ pageSize: 100 }), [], []);
  const { data: contractsData = [] } = useCmsResource(() => cmsService.getContracts({ pageSize: 100 }), [], []);
  const { data: expensesData = [] } = useCmsResource(() => cmsService.getExpenses({ pageSize: 100 }), [], []);
  const cars = asArray(carsData);
  const customers = asArray(customersData);
  const contracts = asArray(contractsData);
  const expenses = asArray(expensesData);
  const monthlyRows = report?.monthlyTrends || [];
  const [customerDrawer, setCustomerDrawer] = useState(false);
  const [expenseDrawer, setExpenseDrawer] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const totals = useMemo(() => ({ revenue: contracts.reduce((sum, item) => sum + Number(item.totalAmount || item.amount || 0), 0), expenses: expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0) }), [contracts, expenses]);
  const profit = totals.revenue - totals.expenses;

  const saveCustomer = async () => { const result = await action.run(() => cmsService.createCustomer(customerForm), 'เพิ่มลูกค้าแล้ว'); if (result) { setCustomerForm(emptyCustomer); setCustomerDrawer(false); } };
  const saveExpense = async () => { const result = await action.run(() => cmsService.createExpense({ ...expenseForm, amount: Number(expenseForm.amount), vehicleId: expenseForm.vehicleId ? Number(expenseForm.vehicleId) : null }), 'เพิ่มรายจ่ายแล้ว'); if (result) { setExpenseForm(emptyExpense); setExpenseDrawer(false); } };

  return (
    <AdminPanel title="ลูกค้า รายรับ และรายงาน" description="ภาพรวมธุรกิจสำหรับเจ้าของรถเช่า รวมลูกค้า รายรับ รายจ่าย และกำไร">
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error.message}</Alert> : null}
        {action.error ? <Alert severity="error">{action.error}</Alert> : null}
        {action.success ? <Alert severity="success">{action.success}</Alert> : null}
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดข้อมูลธุรกิจ..." /> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}><Metric label="รายรับรวม" value={formatMoney(totals.revenue)} color="#15803D" /><Metric label="รายจ่ายรวม" value={formatMoney(totals.expenses)} color="#DC2626" /><Metric label="กำไร" value={formatMoney(profit)} color={profit >= 0 ? colors.primary : '#DC2626'} /><Metric label="ลูกค้าทั้งหมด" value={`${customers.length.toLocaleString('th-TH')} คน`} /></Box>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto"><Tab label="ลูกค้า" value="customers" /><Tab label="รายรับ" value="revenue" /><Tab label="รายจ่าย" value="expenses" /><Tab label="กำไร" value="profit" /></Tabs>
        {tab === 'customers' ? <Stack spacing={2}><Button variant="contained" onClick={() => setCustomerDrawer(true)} sx={{ alignSelf: 'flex-start' }}>เพิ่มลูกค้า</Button><Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>{customers.map((customer) => <CustomerCard key={customer.id} customer={customer} onClick={() => { setCustomerForm({ ...emptyCustomer, ...customer }); setCustomerDrawer(true); }} />)}</Box></Stack> : null}
        {tab === 'revenue' ? <Stack spacing={2}><BarChart title="แนวโน้มรายรับ" rows={monthlyRows} fields={[{ key: 'revenue', label: 'รายรับ', color: '#15803D' }]} />{contracts.map((item) => <ListCard key={item.id} title={`${item.customerName || getCustomerName(customers, item.customerId)} · ${item.vehicleName || getVehicleName(cars, item.vehicleId)}`} value={formatMoney(item.totalAmount || item.amount)} helper={formatDate(item.startDate || item.createdAt)} />)}</Stack> : null}
        {tab === 'expenses' ? <Stack spacing={2}><Button variant="contained" onClick={() => setExpenseDrawer(true)} sx={{ alignSelf: 'flex-start' }}>เพิ่มรายจ่าย</Button><BarChart title="แนวโน้มรายจ่าย" rows={monthlyRows} fields={[{ key: 'expense', label: 'รายจ่าย', color: '#DC2626' }]} />{expenses.map((item) => <ListCard key={item.id} title={`${getVehicleName(cars, item.vehicleId)} · ${expenseLabels[item.category] || item.category}`} value={formatMoney(item.amount)} helper={formatDate(item.expenseDate || item.createdAt)} />)}</Stack> : null}
        {tab === 'profit' ? <Stack spacing={2}><BarChart title="แนวโน้มกำไร" rows={monthlyRows} fields={[{ key: 'revenue', label: 'รายรับ', color: '#15803D' }, { key: 'expense', label: 'รายจ่าย', color: '#DC2626' }, { key: 'profit', label: 'กำไร', color: colors.primary }]} /></Stack> : null}
      </Stack>
      <DrawerShell open={customerDrawer} title="ข้อมูลลูกค้า" onClose={() => setCustomerDrawer(false)}><TextField label="ชื่อลูกค้า" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} /><TextField label="เบอร์โทร" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} /><TextField label="อีเมล" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} /><TextField label="ที่อยู่" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} multiline /><TextField label="บันทึก" value={customerForm.note} onChange={(e) => setCustomerForm({ ...customerForm, note: e.target.value })} multiline minRows={3} /><Button variant="contained" onClick={saveCustomer}>บันทึกลูกค้า</Button></DrawerShell>
      <DrawerShell open={expenseDrawer} title="ค่าใช้จ่ายรถ" onClose={() => setExpenseDrawer(false)}><TextField select SelectProps={{ native: true }} label="รถ" value={expenseForm.vehicleId} onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}><option value="">ไม่ระบุรถ</option>{cars.map((car) => <option key={car.id} value={car.id}>{car.name}</option>)}</TextField><TextField select SelectProps={{ native: true }} label="หมวดรายจ่าย" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>{Object.entries(expenseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</TextField><TextField label="จำนวนเงิน" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /><TextField label="วันที่" type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} InputLabelProps={{ shrink: true }} /><TextField label="หมายเหตุ" value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} multiline minRows={3} /><Button variant="contained" onClick={saveExpense}>บันทึกรายจ่าย</Button></DrawerShell>
    </AdminPanel>
  );
}

function ListCard({ title, value, helper }) { return <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ bgcolor: 'background.paper', borderRadius: '20px', boxShadow: '0 12px 30px rgba(15,17,21,0.035)', justifyContent: 'space-between', p: 2 }}><Box><Typography sx={{ fontWeight: 900 }}>{title}</Typography><Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>{helper}</Typography></Box><Typography sx={{ color: colors.primary, fontWeight: 950 }}>{value}</Typography></Stack>; }
