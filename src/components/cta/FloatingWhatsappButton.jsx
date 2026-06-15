import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { contactConfig } from '../../config/contact.js';
import FloatingContactButton from './FloatingContactButton.jsx';

export default function FloatingWhatsappButton() {
  return (
    <FloatingContactButton href={contactConfig.whatsappUrl} label="ติดต่อ WWJ Car Rent ผ่าน WhatsApp">
      <WhatsAppIcon />
    </FloatingContactButton>
  );
}
