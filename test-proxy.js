import { YoutubeTranscript } from 'youtube-transcript';
YoutubeTranscript.fetchTranscript('M9HQSNmiDGQ', { 
  lang: 'en',
  fetch: (url, options) => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, options)
}).then(console.log).catch(console.error);
