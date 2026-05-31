import { YoutubeTranscript } from 'youtube-transcript';
async function test() {
  try {
    const res = await YoutubeTranscript.fetchTranscript('n20wYm0qP10');
    console.log("Success, found", res.length, "lines");
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
