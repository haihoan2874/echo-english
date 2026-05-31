import { YoutubeTranscript } from 'youtube-transcript';
YoutubeTranscript.fetchTranscript('M9HQSNmiDGQ', { lang: 'en' }).then(console.log).catch(console.error);
