import '../styles/globals.css';
import type { AppProps } from 'next/app';

import AIAssistant from '../components/ai/ai-assistant';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <AIAssistant />
    </>
  );
}

export default MyApp;
