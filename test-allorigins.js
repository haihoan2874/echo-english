import axios from 'axios';
axios.get('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.youtube.com/watch?v=M9HQSNmiDGQ'))
  .then(res => console.log(res.data.includes('captionTracks') ? 'SUCCESS' : 'NO TRACKS'))
  .catch(err => console.error('FAILED', err.message));
