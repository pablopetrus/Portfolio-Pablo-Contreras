const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Load the local index.html
    const filePath = path.resolve(__dirname, '../index.html');
    const fileUrl = `file://${filePath}`;
    
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Force print emulation so the @media print styles kick in for the PDF
    await page.emulateMediaType('print');

    // Wait for web fonts to actually be ready — without this Puppeteer can render
    // with a fallback font and the text comes out with messed-up spacing/kerning.
    await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
    });
    
    // Create public/cv directory if it doesn't exist
    // (PDF lives under public/ so Vite serves and copies it to dist/)
    const cvDir = path.resolve(__dirname, '../public/cv');
    if (!fs.existsSync(cvDir)) {
        fs.mkdirSync(cvDir, { recursive: true });
    }
    
    // Generate PDF
    await page.pdf({
        path: path.resolve(cvDir, 'Pablo_Contreras_CV.pdf'),
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
        }
    });

    await browser.close();
    console.log('PDF generated successfully at public/cv/Pablo_Contreras_CV.pdf');
}

generatePDF().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
