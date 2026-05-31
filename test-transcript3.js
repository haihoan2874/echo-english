import { YoutubeTranscript } from 'youtube-transcript';
YoutubeTranscript.fetchTranscript('NBS7OlWbgS4', { lang: 'en' }).then(console.log).catch(console.error);
