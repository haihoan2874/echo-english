import { YoutubeTranscript } from 'youtube-transcript';
async function test() {
  try {
    const res = await YoutubeTranscript.fetchTranscript('zwoz8yzTtZA');
    console.log("Success, found", res.length, "lines");
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
