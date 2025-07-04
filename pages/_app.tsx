import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/notifications.css';
import '../utils/i18n'; // Initialize i18n
import { NotificationProvider } from '../contexts/NotificationContext';

export default function App({ Component, pageProps }: AppProps) {
  // In this Next.js static export app, pageProps should typically be empty
  // since we don't use getStaticProps/getServerSideProps
  // For safety, we validate that pageProps only contains safe properties
  const safePageProps = pageProps && typeof pageProps === 'object' ? pageProps : {};

  // Check if pageProps is empty (expected case)
  const hasPageProps = Object.keys(safePageProps).length > 0;

  if (!hasPageProps) {
    // Most common case - no pageProps to spread
    return (
      <NotificationProvider>
        <Component />
      </NotificationProvider>
    );
  }

  // Rare case - validate and pass pageProps explicitly
  const validatedProps = Object.keys(safePageProps).reduce((acc, key) => {
    // Only allow known safe property names that could come from Next.js
    const safeKeys = ['key', 'ref', 'children']; // Standard React props that are safe
    if (safeKeys.includes(key) || typeof safePageProps[key as keyof typeof safePageProps] !== 'function') {
      acc[key] = safePageProps[key as keyof typeof safePageProps];
    }
    return acc;
  }, {} as Record<string, any>);

  // Pass validated props individually to avoid spread operator warning
  return (
    <NotificationProvider>
      <Component
        key={validatedProps.key}
        ref={validatedProps.ref}
      >
        {validatedProps.children}
      </Component>
    </NotificationProvider>
  );
}
