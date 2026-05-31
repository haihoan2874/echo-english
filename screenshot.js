const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  
  // Go to the page
  console.log('Navigating...');
  await page.goto('http://localhost:5173/lesson/M9HQSNmiDGQ', { waitUntil: 'networkidle0' });
  
  // Wait a bit for the transcript to load
  await new Promise(r => setTimeout(r, 5000));
  
  // Take screenshot
  await page.screenshot({ path: 'screenshot_test.png' });
  console.log('Screenshot saved to screenshot_test.png');
  
  await browser.close();
})();
