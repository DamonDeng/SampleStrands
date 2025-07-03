import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/notifications.css';
import '../utils/i18n'; // Initialize i18n
import { NotificationProvider } from '../contexts/NotificationContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}
