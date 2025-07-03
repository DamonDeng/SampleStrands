import { useState, useEffect } from 'react';
import Head from 'next/head';
import ChatLayout from '../components/ChatLayout';
import { APP_CONFIG } from '../utils/constants';

export default function Home() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(typeof window !== 'undefined' && window.electronAPI !== undefined);
  }, []);

  return (
    <>
      <Head>
        <title>{APP_CONFIG.appNameDisplay}</title>
        <meta name="description" content={APP_CONFIG.appDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <ChatLayout isElectron={isElectron} />
      </main>
    </>
  );
}
