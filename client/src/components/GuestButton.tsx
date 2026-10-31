import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

// Starts a guest session (bundled questions, progress kept in this browser) and opens Practice.
export function GuestButton(props: Omit<React.ComponentProps<typeof Button>, 'onClick' | 'type'>) {
  const startGuest = useAuthStore((s) => s.startGuest);
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      onClick={() => {
        startGuest();
        navigate('/practice');
      }}
      {...props}
    />
  );
}
