import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import { contactConfig } from '../../config/contact.js';
import FloatingContactButton from './FloatingContactButton.jsx';

export default function FloatingCallButton() {
  return (
    <FloatingContactButton href={`tel:${contactConfig.phone}`} label="โทรหา WWJ Car Rent">
      <LocalPhoneIcon />
    </FloatingContactButton>
  );
}
