// plugins/restaurant-menu/index.js
const fs = require('fs').promises;
const fss = require('fs'); // Synchronous for operations like existsSync
const path = require('path');

/**
 * Converts a local file path to a base64 data URI.
 * @param {string} filePath - The absolute path to the file.
 * @param {string} mimeType - The MIME type of the file (e.g., 'image/jpeg', 'image/png').
 * @returns {Promise<string>} A Promise that resolves with the base64 data URI.
 */
async function pathToBase64(filePath, mimeType) {
    if (!fss.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
    }
    const fileBuffer = await fs.readFile(filePath);
    return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

class RestaurantMenuHandler {
    constructor(coreUtils) {
        this.markdownUtils = coreUtils.markdownUtils;
        this.pdfGenerator = coreUtils.pdfGenerator;
    }

    async generate(data, pluginSpecificConfig, globalConfig, outputDir, outputFilenameOpt, pluginBasePath) {
        console.log(`INFO (RestaurantMenuHandler): Generating menu PDF.`);

        const { markdownFilePath } = data;
        if (!markdownFilePath || !fss.existsSync(markdownFilePath)) {
            throw new Error(`Input Markdown file not found: ${markdownFilePath}`);
        }

        try {
            await fs.mkdir(outputDir, { recursive: true });

            const rawMarkdownContent = await fs.readFile(markdownFilePath, 'utf8');
            const { data: fm, content: markdownBody } = this.markdownUtils.extractFrontMatter(rawMarkdownContent);

            // 1. Load and process the logo image (profile icon), ensuring it resolves relative
            //    to the plugin base path
            const logoPath = path.resolve(pluginBasePath, 'logo.png'); 
            let logoBase64 = '';
            if (fss.existsSync(logoPath)) {
                logoBase64 = await pathToBase64(logoPath, 'image/png'); 
                // Adjust MIME type if logo is JPEG etc.
            } else {
                console.warn(`WARN (RestaurantMenuHandler): Logo file not found at ${logoPath}. Skipping logo.`);
            }

            // Remove Hugo shortcodes from the Markdown body before rendering
            // This pattern specifically targets `{{% menu %}}` and `{{% /menu %}}`
            const cleanedMarkdownBody = markdownBody.replace(/{{%\s*menu\s*%}}\n?/g, '').replace(/\n?{{%\s*\/menu\s*%}}/g, '');

            // Render the main Markdown body to HTML
            // Passing empty options for TOC, anchor, and math as they are not needed
            const renderedMenuHtml = this.markdownUtils.renderMarkdownToHtml(
                cleanedMarkdownBody,
                {}, // toc_options (not needed)
                {}, // anchor_options (not needed)
                false // math (not needed)
            );

            // Construct custom HTML layout, incorporating the grayscale logo and rendered menu
            const htmlBodyContent = `
                <div class="menu-container">
                    <div class="header-section">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="menu-logo" style="filter: grayscale(100%);">` : ''}
                        <h1 class="menu-title">${fm.title || 'Restaurant Menu'}</h1>
                        <p class="menu-date">${fm.date ? new Date(fm.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                    </div>
                    <div class="menu-content">
                        ${renderedMenuHtml}
                    </div>
                    <div class="footer-note">
                        ${fm.footerNote ? `<p>${fm.footerNote}</p>` : ''}
                    </div>
                </div>
            `;

            // Determine output PDF path
            const menuTitleForFile = fm.title || 'restaurant-menu';
            const baseOutputFilename = outputFilenameOpt || `${this.markdownUtils.generateSlug(menuTitleForFile)}.pdf`;
            const finalOutputPdfPath = path.join(outputDir, baseOutputFilename);

            // Merge PDF options (from global and plugin-specific config)
            const pdfOptions = {
                ...(globalConfig.global_pdf_options || {}),
                ...(pluginSpecificConfig.pdf_options || {}),
                margin: {
                    ...((globalConfig.global_pdf_options || {}).margin || {}),
                    ...((pluginSpecificConfig.pdf_options || {}).margin || {}),
                }
            };
            if (pdfOptions.width || pdfOptions.height) {
                delete pdfOptions.format; // Prioritize explicit width/height if set
            }

            // Load CSS files
            const cssFileContentsArray = [];
            if (pluginSpecificConfig.css_files && Array.isArray(pluginSpecificConfig.css_files)) {
                for (const cssFile of pluginSpecificConfig.css_files) {
                    const cssFilePath = path.resolve(pluginBasePath, cssFile);
                    if (fss.existsSync(cssFilePath)) {
                        cssFileContentsArray.push(await fs.readFile(cssFilePath, 'utf8'));
                    } else {
                        console.warn(`WARN (RestaurantMenuHandler): CSS file not found at ${cssFilePath}`);
                    }
                }
            }

            await this.pdfGenerator.generatePdf(
                htmlBodyContent,
                finalOutputPdfPath,
                pdfOptions,
                cssFileContentsArray
            );

            console.log(`Successfully generated PDF: ${finalOutputPdfPath}`);
            return finalOutputPdfPath;

        } catch (error) {
            console.error(`ERROR (RestaurantMenuHandler): Failed to generate menu for ${markdownFilePath}: ${error.message}`);
            if (error.stack) {
                console.error(error.stack);
            }
            throw error;
        }
    }
}
module.exports = RestaurantMenuHandler;
