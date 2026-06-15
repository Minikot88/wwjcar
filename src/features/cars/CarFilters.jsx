import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { memo } from 'react';
import { colors } from '../../theme/colors.js';
import { categoryOptions, getBrands, getTransmissions, getTransmissionLabel, sortOptions } from './carUtils.js';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    bgcolor: colors.canvasLight,
    color: colors.bodyOnLight
  },
  '& .MuiInputLabel-root': {
    color: colors.muted
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.hairlineOnLight
  },
  '& .MuiSvgIcon-root': {
    color: colors.muted
  }
};

function CarFilters({ filters, onChange }) {
  const brands = getBrands();
  const transmissions = getTransmissions();

  const updateFilter = (key, value) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} aria-label="หมวดหมู่รถเช่า">
        <Button
          variant={!filters.category ? 'contained' : 'outlined'}
          onClick={() => updateFilter('category', '')}
          sx={{ borderRadius: '999px' }}
        >
          รถทั้งหมด
        </Button>
        {categoryOptions.map((category) => (
          <Button
            key={category}
            variant={filters.category === category ? 'contained' : 'outlined'}
            onClick={() => updateFilter('category', category)}
            sx={{ borderRadius: '999px' }}
          >
            {category}
          </Button>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(240px, 1.4fr) repeat(3, minmax(180px, 1fr))'
          },
          gap: 2
        }}
      >
        <TextField
          label="ค้นหารถ"
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <FormControl sx={fieldSx}>
        <InputLabel id="brand-filter-label">ยี่ห้อรถ</InputLabel>
        <Select
          labelId="brand-filter-label"
          label="ยี่ห้อรถ"
          value={filters.brand}
          onChange={(event) => updateFilter('brand', event.target.value)}
        >
          <MenuItem value="">ทุกยี่ห้อ</MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand} value={brand}>
              {brand}
            </MenuItem>
          ))}
        </Select>
        </FormControl>

        <FormControl sx={fieldSx}>
        <InputLabel id="transmission-filter-label">ระบบเกียร์</InputLabel>
        <Select
          labelId="transmission-filter-label"
          label="ระบบเกียร์"
          value={filters.transmission}
          onChange={(event) => updateFilter('transmission', event.target.value)}
        >
          <MenuItem value="">ทุกระบบเกียร์</MenuItem>
          {transmissions.map((transmission) => (
            <MenuItem key={transmission} value={transmission}>
              {getTransmissionLabel(transmission)}
            </MenuItem>
          ))}
        </Select>
        </FormControl>

        <FormControl sx={fieldSx}>
        <InputLabel id="sort-filter-label">เรียงตาม</InputLabel>
        <Select
          labelId="sort-filter-label"
          label="เรียงตาม"
          value={filters.sort}
          onChange={(event) => updateFilter('sort', event.target.value)}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default memo(CarFilters);
