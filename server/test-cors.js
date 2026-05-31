const { YoutubeTranscript } = require('youtube-transcript');
const customFetch = (url, options) => fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, options);
YoutubeTranscript.fetchTranscript('dN3CsGfH7rY', { fetch: customFetch }).then(t => console.log('Length:', t.length)).catch(console.error);
