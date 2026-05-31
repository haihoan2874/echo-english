import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  // CORS headers for local testing if needed
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Bypass-Tunnel-Reminder');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Missing video ID' });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(id);
    const formattedTranscript = transcript.map(item => ({
      text: item.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      start: item.offset / 1000,
      end: (item.offset + item.duration) / 1000
    }));

    res.status(200).json({
      success: true,
      data: formattedTranscript
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transcript. The video might not have English subtitles.',
      error: error.message
    });
  }
}
