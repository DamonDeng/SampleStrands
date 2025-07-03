import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../utils/i18n'; // Initialize i18n

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
