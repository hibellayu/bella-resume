const puppeteer = require('puppeteer');
const path = require('path');

async function main() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  });

  const page = await browser.newPage();
  const htmlPath = path.resolve(__dirname, '../zh/index.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // 注入台北時間戳記（格式：2026年5月13日 14時）
  const ts = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    hour12: false,
  }).format(new Date());

  await page.evaluate((timestamp) => {
    const el = document.getElementById('pdf-timestamp');
    if (el) el.textContent = '最後更新：' + timestamp;
  }, ts);

  const outPath = path.resolve(__dirname, '../assets/黃于芹_履歷_2026.pdf');
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });

  await browser.close();
  console.log('PDF 已生成：' + outPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
