const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        fullscreen: true,
        autoHideMenuBar: true,
    });

    const isDevEnv = !app.isPackaged;

    if (isDevEnv) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// Function to read printer config
function getPrinterConfig() {
    try {
        const configPath = app.isPackaged
            ? path.join(process.resourcesPath, 'printer-config.json')
            : path.join(__dirname, '../printer-config.json');

        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Failed to read printer config:', e);
    }
    return { printerName: "" };
}

// Get list of printers
ipcMain.handle('get-printers', async () => {
    const win = BrowserWindow.getAllWindows()[0];
    const printers = await win.webContents.getPrintersAsync();
    const config = getPrinterConfig();
    return { printers, config };
});

// Handle Print Requests
ipcMain.handle('print-image', async (event, { imageSrc, printerName }) => {
    return new Promise((resolve) => {
        try {
            // Write the base64 image to a temp file to avoid data URL length issues
            const base64Data = imageSrc.replace(/^data:image\/\w+;base64,/, '');
            const tempImagePath = path.join(os.tmpdir(), `photobooth-print-${Date.now()}.png`);
            fs.writeFileSync(tempImagePath, Buffer.from(base64Data, 'base64'));

            const tempImageUrl = `file:///${tempImagePath.replace(/\\/g, '/')}`;

            let printWindow = new BrowserWindow({
                show: false,
                width: 400,
                height: 600,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                }
            });

            const htmlContent = `<!DOCTYPE html>
<html>
<head>
<style>
    @page { 
        size: 100mm 148mm portrait; 
        margin: 0; 
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
        width: 100mm; 
        height: 148mm; 
        overflow: hidden;
        background: black;
    }
    img { 
        width: 100mm;
        height: 148mm;
        object-fit: cover; /* Back to cover now that aspect ratios match perfectly */
        display: block;
    }
</style>
</head>
<body>
    <img src="${tempImageUrl}" />
</body>
</html>`;

            // Write HTML to a temp file too (avoids data: URL length limits)
            const tempHtmlPath = path.join(os.tmpdir(), `photobooth-print-${Date.now()}.html`);
            fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

            printWindow.loadFile(tempHtmlPath);

            printWindow.webContents.on('did-finish-load', () => {
                // Small delay to ensure image is fully rendered
                setTimeout(() => {
                    const printOptions = {
                        silent: true,
                        printBackground: true,
                        deviceName: printerName || '',
                        margins: { marginType: 'none' },
                        pageSize: { width: 100000, height: 148000 }, // 100x148mm in microns
                        landscape: false,
                        copies: 1,
                    };

                    console.log(`[Print] Sending to printer: "${printerName}"`);

                    printWindow.webContents.print(printOptions, (success, failureReason) => {
                        console.log('[Print] Result:', success, failureReason);
                        printWindow.close();

                        // Cleanup temp files
                        try { fs.unlinkSync(tempImagePath); } catch (e) { }
                        try { fs.unlinkSync(tempHtmlPath); } catch (e) { }

                        resolve({ success, failureReason: failureReason || null });
                    });
                }, 800);
            });

            printWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                console.error('[Print] Page failed to load:', errorCode, errorDescription);
                printWindow.close();
                try { fs.unlinkSync(tempImagePath); } catch (e) { }
                try { fs.unlinkSync(tempHtmlPath); } catch (e) { }
                resolve({ success: false, failureReason: `Page load failed: ${errorDescription}` });
            });

        } catch (err) {
            console.error('[Print] Unexpected error:', err);
            resolve({ success: false, failureReason: err.message });
        }
    });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
