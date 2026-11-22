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

    // The archive PDF keeps the complete portfolio, with a compact reading layout.
    // Resolve public images for file:// printing; runtime modules are not needed
    // because index.html contains the complete English fallback content.
    await page.evaluate((publicDir) => {
        for (const image of document.images) {
            const source = image.getAttribute('src');
            if (source && source.startsWith('/')) {
                image.src = new URL(`file:///${publicDir.replaceAll('\\', '/')}${source}`).href;
            }
            image.loading = 'eager';
        }
    }, path.resolve(__dirname, '../public'));
    await page.addStyleTag({ content: `
        @media print {
            @page { size: A4; margin: 10mm; }
            *, *::before, *::after { animation: none !important; transition: none !important; }
            html, body { font-size: 9pt !important; line-height: 1.4 !important; }
            section { break-inside: auto !important; page-break-inside: auto !important; padding: 9pt 0 !important; }
            .container { padding: 0 !important; }
            .hero { padding: 0 0 10pt !important; margin-bottom: 7pt !important; background: white !important; }
            .hero h1 { color: #171717 !important; -webkit-text-fill-color: #171717 !important; }
            .hero h2 { font-size: 11pt !important; }
            .hero p { font-size: 9pt !important; }
            .section-title { font-size: 13pt !important; margin: 0 0 6pt !important; break-after: avoid; }
            .section-header { margin-bottom: 5pt !important; }
            .about-content, .about-card, .info-card, .project-item, .press-card, #contact { padding: 8pt !important; border-radius: 0 !important; }
            .about-content p, .about-card p, #contact p { font-size: 9pt !important; line-height: 1.4 !important; margin: 3pt 0 !important; text-align: left !important; }
            .about-content br { display: none !important; }
            .projects-list, .info-grid, .skills-section-inner { display: block !important; }
            .project-item, .info-card, .work-row, .skill-group, .programme-photo { break-inside: avoid; page-break-inside: avoid; margin: 0 0 7pt !important; }
            .project-item h3, .info-card h3, .skill-group h3, .work-row h3 { font-size: 10pt !important; margin: 0 0 3pt !important; }
            .project-item p, .info-card p, .work-row p, .section-subtitle { font-size: 9pt !important; margin: 3pt 0 !important; }
            .work-row { padding: 6pt 0 !important; }
            .work-links { font-size: 8pt !important; margin: 3pt 0 !important; gap: 8pt !important; }
            .press-header { padding: 0 !important; }
            .press-headline { font-size: 11pt !important; margin: 5pt 0 !important; }
            .press-body { padding: 0 !important; display: block !important; min-height: 0 !important; }
            .press-media { display: none !important; }
            .press-content, .press-text, .press-text-secondary { padding: 0 !important; min-height: 0 !important; font-size: 9pt !important; margin: 4pt 0 !important; }
            .press-cta-row { margin-top: 5pt !important; }
            .programme-photo { margin: 7pt 0 !important; }
            .programme-photo img { height: 150px !important; width: auto !important; max-width: 100% !important; object-fit: contain !important; }
            #contact { background: white !important; border: 0 !important; text-align: left !important; break-inside: avoid !important; }
            #contact .cta-buttons { display: flex !important; justify-content: flex-start !important; gap: 8pt !important; margin: 5pt 0 !important; }
            #contact .btn { font-size: 8pt !important; padding: 2pt 0 !important; background: white !important; color: #171717 !important; }
        }
    ` });

    // Wait for web fonts to actually be ready — without this Puppeteer can render
    // with a fallback font and the text comes out with messed-up spacing/kerning.
    await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
        await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
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
