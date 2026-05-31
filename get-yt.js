import axios from 'axios';
axios.get('https://www.youtube.com/results?search_query=' + encodeURIComponent("Luyện nghe Tiếng Anh I'm Mary"))
  .then(res => {
    const html = res.data;
    const match = html.match(/"videoId":"([^"]+)"/);
    console.log(match ? match[1] : 'not found');
  });
