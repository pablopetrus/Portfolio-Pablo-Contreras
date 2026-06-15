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
    
    // Create cv directory if it doesn't exist
    const cvDir = path.resolve(__dirname, '../cv');
    if (!fs.existsSync(cvDir)) {
        fs.mkdirSync(cvDir);
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
    console.log('PDF generated successfully at cv/Pablo_Contreras_CV.pdf');
}

generatePDF().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
