import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/notifications.css';
import '../utils/i18n'; // Initialize i18n
import { NotificationProvider } from '../contexts/NotificationContext';

export default function App({ Component, pageProps }: AppProps) {
  // Ensure pageProps is a valid object and only contains safe properties
  const safePageProps = pageProps && typeof pageProps === 'object' ? pageProps : {};

  // For additional safety, we can validate that pageProps only contains expected properties
  // In this Next.js app, pages don't use getStaticProps/getServerSideProps, so pageProps should be empty
  const validatedProps = Object.keys(safePageProps).reduce((acc, key) => {
    // Only allow known safe property names that could come from Next.js
    const safeKeys = ['key', 'ref', 'children']; // Standard React props that are safe
    if (safeKeys.includes(key) || typeof safePageProps[key as keyof typeof safePageProps] !== 'function') {
      acc[key] = safePageProps[key as keyof typeof safePageProps];
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <NotificationProvider>
      <Component {...validatedProps} />
    </NotificationProvider>
  );
}
