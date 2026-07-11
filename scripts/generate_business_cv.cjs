const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateBusinessCV() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const filePath = path.resolve(__dirname, '../cv-business.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });

    const cvDir = path.resolve(__dirname, '../public/cv');
    if (!fs.existsSync(cvDir)) fs.mkdirSync(cvDir, { recursive: true });

    await page.pdf({
        path: path.resolve(cvDir, 'Pablo_Contreras_Business_CV.pdf'),
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        pageRanges: '1',
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();
    console.log('Business CV generated at public/cv/Pablo_Contreras_Business_CV.pdf');
}

generateBusinessCV().catch(err => {
    console.error('Error generating business CV:', err);
    process.exit(1);
});
