import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
import { AdminAlerts, AdminEmptyState, AdminLoadingBlock } from '../../components/admin/AdminFeedback.jsx';
import { useAdminAction } from '../../hooks/useAdminAction.js';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';
import { colors } from '../../theme/colors.js';
import { firstError, required } from '../../utils/adminValidation.js';

const statusConfig = {
  published: { label: 'เผยแพร่', color: 'success', description: 'เปิดให้ลูกค้าเข้าชมได้' },
  draft: { label: 'แบบร่าง', color: 'default', description: 'เห็นเฉพาะผู้ดูแล' },
  hidden: { label: 'ซ่อน', color: 'warning', description: 'ลูกค้าเข้าแล้วพบ 404' },
  archived: { label: 'เก็บถาวร', color: 'default', description: 'ไม่แสดงบนเว็บไซต์' }
};

const supportedPages = [
  { slug: 'home', name: 'หน้าหลัก' },
  { slug: 'about-us', name: 'เกี่ยวกับเรา' },
  { slug: 'faq', name: 'คำถามที่พบบ่อย' },
  { slug: 'rental-conditions', name: 'เงื่อนไขการเช่า' },
  { slug: 'contact', name: 'ติดต่อเรา' },
  { slug: 'reviews', name: 'รีวิวลูกค้า' },
  { slug: 'privacy-policy', name: 'นโยบายความเป็นส่วนตัว' },
  { slug: 'terms-and-conditions', name: 'ข้อกำหนดการใช้งาน' },
  { slug: 'blog', name: 'บทความ' }
];

const emptyPage = {
  slug: '',
  title: '',
  metaTitle: '',
  metaDescription: '',
  canonical: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  contentTitle: '',
  contentBody: '',
  status: 'draft',
  schema: {},
  content: {}
};

function pageToForm(page = {}) {
  const content = page.content || {};
  return {
    ...emptyPage,
    ...page,
    contentTitle: content.title || content.heading || page.title || '',
    contentBody: content.body || content.description || '',
    schema: page.schema || {},
    content
  };
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function publicPath(slug) {
  if (!slug || slug === 'home') return '/';
  if (slug === 'faq') return '/faq';
  if (slug === 'blog') return '/blog';
  return `/${slug}`;
}

function normalizeSlug(value) {
  return String(value || '').replace(/^\//, '').trim();
}

export default function AdminPages() {
  const { data: pages, isLoading, error } = useCmsResource(() => cmsService.getPages(true), [], []);
  const action = useAdminAction();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyPage);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuPage, setMenuPage] = useState(null);

  const pagesBySlug = useMemo(() => new Map(pages.map((page) => [page.slug, page])), [pages]);
  const missingSupportedPages = supportedPages.filter((page) => !pagesBySlug.has(page.slug));
  const filteredPages = useMemo(() => {
    const text = query.trim().toLowerCase();
    return pages.filter((page) => {
      const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
      const matchesText = !text || `${page.title} ${page.slug}`.toLowerCase().includes(text);
      return matchesStatus && matchesText;
    });
  }, [pages, query, statusFilter]);

  const summary = useMemo(() => {
    return pages.reduce(
      (accumulator, page) => {
        accumulator[page.status] = (accumulator[page.status] || 0) + 1;
        accumulator.total += 1;
        return accumulator;
      },
      { total: 0, published: 0, draft: 0, hidden: 0, archived: 0 }
    );
  }, [pages]);

  const openMenu = (event, page) => {
    setMenuAnchor(event.currentTarget);
    setMenuPage(page);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuPage(null);
  };

  const openEditor = (page = null) => {
    setSelected(page?.id || null);
    setForm(page ? pageToForm(page) : emptyPage);
    setIsEditorOpen(true);
    action.clearFeedback();
  };

  const openMissingPage = (page) => {
    openEditor({
      ...emptyPage,
      slug: page.slug,
      title: page.name,
      metaTitle: page.name,
      content: { title: page.name },
      status: 'published'
    });
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const payload = () => ({
    slug: normalizeSlug(form.slug),
    title: form.title,
    metaTitle: form.metaTitle || null,
    metaDescription: form.metaDescription || null,
    canonical: form.canonical || null,
    ogTitle: form.ogTitle || null,
    ogDescription: form.ogDescription || null,
    ogImage: form.ogImage || null,
    schema: form.schema || {},
    status: form.status,
    content: {
      ...(form.content || {}),
      title: form.contentTitle,
      body: form.contentBody
    }
  });

  const validate = () => firstError([
    required(normalizeSlug(form.slug), 'กรุณาระบุ Slug'),
    required(form.title, 'กรุณาระบุชื่อหน้า')
  ]);

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      action.setError(validationError);
      return;
    }

    if (selected) {
      await action.run(() => cmsService.updatePage(selected, payload()), 'บันทึกหน้าเว็บแล้ว');
    } else {
      const created = await action.run(() => cmsService.createPage(payload()), 'สร้างหน้าเว็บแล้ว');
      if (created?.id) setSelected(created.id);
    }
    setIsEditorOpen(false);
  };

  const setStatus = async (page, status) => {
    closeMenu();
    await action.run(() => cmsService.updatePageStatus(page.id, status), `เปลี่ยนสถานะเป็น ${statusConfig[status].label} แล้ว`);
  };

  const duplicate = async (page) => {
    closeMenu();
    await action.run(() => cmsService.duplicatePage(page.id), 'สร้างสำเนาหน้าเว็บแล้ว');
  };

  const remove = async (page) => {
    closeMenu();
    const confirmed = window.confirm(`ต้องการลบ "${page.title}" ใช่ไหม? หน้าเว็บจะถูกเก็บถาวรและไม่แสดงบนเว็บไซต์`);
    if (!confirmed) return;
    await action.run(() => cmsService.deletePage(page.id), 'ลบหน้าเว็บแล้ว');
  };

  return (
    <AdminPanel title="จัดการหน้าเว็บ" description="ควบคุมสถานะหน้าเว็บ เนื้อหา และการเผยแพร่ โดยไม่ต้องแก้โค้ด" actionLabel="เพิ่มหน้าเว็บ" onAction={() => openEditor()}>
      <Stack spacing={3}>
        <AdminAlerts error={action.error || error?.message} success={action.success} />
        {isLoading ? <AdminLoadingBlock label="กำลังโหลดหน้าเว็บ..." /> : null}

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' } }}>
          <SummaryCard label="ทั้งหมด" value={summary.total} />
          <SummaryCard label="เผยแพร่" value={summary.published} tone="success" />
          <SummaryCard label="แบบร่าง" value={summary.draft} />
          <SummaryCard label="ซ่อน" value={summary.hidden} tone="warning" />
          <SummaryCard label="เก็บถาวร" value={summary.archived} />
        </Box>

        {missingSupportedPages.length ? (
          <Box sx={{ bgcolor: colors.canvasElevated, borderRadius: '20px', p: 2.5 }}>
            <Typography fontWeight={900}>หน้าสำคัญที่ยังไม่ได้สร้างใน CMS</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
              {missingSupportedPages.map((page) => (
                <Button key={page.slug} size="small" variant="outlined" onClick={() => openMissingPage(page)}>
                  เพิ่ม {page.name}
                </Button>
              ))}
            </Stack>
          </Box>
        ) : null}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
          <TextField
            label="ค้นหาหน้าเว็บ"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ maxWidth: { md: 360 }, width: '100%' }}
          />
          <TextField
            select
            SelectProps={{ native: true }}
            label="สถานะ"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{ minWidth: { md: 180 } }}
          >
            <option value="all">ทุกสถานะ</option>
            {Object.entries(statusConfig).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </TextField>
        </Stack>

        {!filteredPages.length && !isLoading ? <AdminEmptyState label="ไม่พบหน้าเว็บที่ตรงกับเงื่อนไข" /> : null}

        <Stack spacing={1.25}>
          {filteredPages.map((page) => (
            <PageRow
              key={page.id}
              page={page}
              onEdit={() => openEditor(page)}
              onMenu={openMenu}
            />
          ))}
        </Stack>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        {menuPage ? [
          <MenuItem key="view" component="a" href={publicPath(menuPage.slug)} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            <LaunchOutlinedIcon fontSize="small" /> เปิดหน้าเว็บ
          </MenuItem>,
          <MenuItem key="preview" component="a" href={`${publicPath(menuPage.slug)}?preview=1`} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
            <PreviewOutlinedIcon fontSize="small" /> Preview
          </MenuItem>,
          <MenuItem key="publish" onClick={() => setStatus(menuPage, 'published')}>
            <PublishOutlinedIcon fontSize="small" /> เผยแพร่
          </MenuItem>,
          <MenuItem key="draft" onClick={() => setStatus(menuPage, 'draft')}>
            <VisibilityOffOutlinedIcon fontSize="small" /> ยกเลิกเผยแพร่
          </MenuItem>,
          <MenuItem key="hidden" onClick={() => setStatus(menuPage, 'hidden')}>
            <VisibilityOffOutlinedIcon fontSize="small" /> ซ่อนหน้าเว็บ
          </MenuItem>,
          <MenuItem key="archive" onClick={() => setStatus(menuPage, 'archived')}>
            <ArchiveOutlinedIcon fontSize="small" /> เก็บถาวร
          </MenuItem>,
          <MenuItem key="duplicate" onClick={() => duplicate(menuPage)}>
            <ContentCopyOutlinedIcon fontSize="small" /> ทำสำเนา
          </MenuItem>,
          <MenuItem key="delete" onClick={() => remove(menuPage)} sx={{ color: 'error.main' }}>
            <DeleteOutlineOutlinedIcon fontSize="small" /> ลบ
          </MenuItem>
        ] : null}
      </Menu>

      <Dialog open={isEditorOpen} onClose={() => setIsEditorOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{selected ? 'แก้ไขหน้าเว็บ' : 'เพิ่มหน้าเว็บ'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 180px' } }}>
              <TextField label="Slug" value={form.slug} onChange={(event) => update('slug', event.target.value)} helperText="เช่น about-us, privacy-policy" required />
              <TextField select SelectProps={{ native: true }} label="สถานะ" value={form.status} onChange={(event) => update('status', event.target.value)}>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </TextField>
            </Box>
            <TextField label="ชื่อหน้า" value={form.title} onChange={(event) => update('title', event.target.value)} required />
            <TextField label="หัวข้อบนหน้าเว็บ" value={form.contentTitle} onChange={(event) => update('contentTitle', event.target.value)} />
            <TextField label="เนื้อหาหลัก" value={form.contentBody} onChange={(event) => update('contentBody', event.target.value)} multiline minRows={6} />

            <Box sx={{ bgcolor: colors.canvas, borderRadius: '18px', p: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1.5 }}>SEO ขั้นสูง</Typography>
              <Stack spacing={1.5}>
                <TextField label="SEO Title" value={form.metaTitle || ''} onChange={(event) => update('metaTitle', event.target.value)} />
                <TextField label="Meta Description" value={form.metaDescription || ''} onChange={(event) => update('metaDescription', event.target.value)} multiline minRows={2} />
                <TextField label="Canonical URL" value={form.canonical || ''} onChange={(event) => update('canonical', event.target.value)} />
                <TextField label="Open Graph Title" value={form.ogTitle || ''} onChange={(event) => update('ogTitle', event.target.value)} />
                <TextField label="Open Graph Description" value={form.ogDescription || ''} onChange={(event) => update('ogDescription', event.target.value)} multiline minRows={2} />
                <TextField label="Open Graph Image" value={form.ogImage || ''} onChange={(event) => update('ogImage', event.target.value)} />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsEditorOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={save} disabled={action.isBusy}>
            {action.isBusy ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPanel>
  );
}

function SummaryCard({ label, value, tone = 'default' }) {
  const color = tone === 'success' ? 'success.main' : tone === 'warning' ? 'warning.main' : 'text.primary';
  return (
    <Box sx={{ bgcolor: colors.canvasElevated, borderRadius: '18px', p: 2 }}>
      <Typography color="text.secondary" variant="caption">{label}</Typography>
      <Typography sx={{ color, fontSize: '1.8rem', fontWeight: 950, lineHeight: 1.15 }}>{value}</Typography>
    </Box>
  );
}

function PageRow({ page, onEdit, onMenu }) {
  const config = statusConfig[page.status] || statusConfig.draft;
  return (
    <Box
      sx={{
        bgcolor: colors.canvasElevated,
        borderRadius: '20px',
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', lg: '1.5fr 0.9fr 0.9fr 0.9fr auto' },
        p: { xs: 2, md: 2.25 },
        alignItems: 'center'
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={950} noWrap>{page.title}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>/{page.slug}</Typography>
      </Box>
      <Chip size="small" color={config.color} label={config.label} sx={{ justifySelf: { lg: 'start' }, width: 'fit-content' }} />
      <Box>
        <Typography variant="caption" color="text.secondary">อัปเดตล่าสุด</Typography>
        <Typography fontWeight={800} sx={{ fontSize: '.9rem' }}>{formatDate(page.updatedAt)}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">แก้ไขโดย</Typography>
        <Typography fontWeight={800} sx={{ fontSize: '.9rem' }}>{page.updatedByName || '-'}</Typography>
      </Box>
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
        <Tooltip title="แก้ไข">
          <IconButton aria-label={`แก้ไข ${page.title}`} onClick={onEdit}>
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="เมนูเพิ่มเติม">
          <IconButton aria-label={`เมนู ${page.title}`} onClick={(event) => onMenu(event, page)}>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
