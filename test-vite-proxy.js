import fetch from 'node-fetch';
import { YoutubeTranscript } from 'youtube-transcript';

(async () => {
  try {
    const fetchConfig = { lang: 'en' };
    fetchConfig.fetch = (url, options) => {
      const proxyUrl = url.replace('https://www.youtube.com', 'http://127.0.0.1:5173/api/youtube');
      console.log('Fetching via proxy:', proxyUrl);
      return fetch(proxyUrl, options);
    };

    const res = await YoutubeTranscript.fetchTranscript('M9HQSNmiDGQ', fetchConfig);
    console.log('Success, length:', res.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
