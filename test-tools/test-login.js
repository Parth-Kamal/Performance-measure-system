const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => {
    console.error(`BROWSER REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to http://localhost:3001/login');
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0' });

  console.log('Typing credentials...');
  await page.type('input[type="email"]', 'alice.johnson@employee.com');
  await page.type('input[type="password"]', '12345678');

  console.log('Clicking sign in...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log('Navigation timeout (expected if it hangs)')),
  ]);

  console.log('Current URL after submit:', page.url());
  
  // Wait a bit to see if there are any late logs
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
