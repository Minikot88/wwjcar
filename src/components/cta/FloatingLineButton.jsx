import ChatIcon from '@mui/icons-material/Chat';
import { contactConfig } from '../../config/contact.js';
import FloatingContactButton from './FloatingContactButton.jsx';

export default function FloatingLineButton() {
  return (
    <FloatingContactButton href={contactConfig.lineUrl} label="ติดต่อ WWJ Car Rent ผ่าน LINE" primary>
      <ChatIcon />
    </FloatingContactButton>
  );
}
