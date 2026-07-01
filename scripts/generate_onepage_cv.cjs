const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateOnepageCV() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const filePath = path.resolve(__dirname, '../onepage-cv.html');
    const fileUrl = `file://${filePath}`;

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Force print emulation so @media print styles kick in
    await page.emulateMediaType('print');

    // Wait for web fonts to actually be ready
    await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
    });

    const cvDir = path.resolve(__dirname, '../public/cv');
    if (!fs.existsSync(cvDir)) {
        fs.mkdirSync(cvDir, { recursive: true });
    }

    await page.pdf({
        path: path.resolve(cvDir, 'Pablo_Contreras_Onepage_CV.pdf'),
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        pageRanges: '1',
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();
    console.log('One-page CV generated at public/cv/Pablo_Contreras_Onepage_CV.pdf');
}

generateOnepageCV().catch(err => {
    console.error('Error generating one-page CV:', err);
    process.exit(1);
});
