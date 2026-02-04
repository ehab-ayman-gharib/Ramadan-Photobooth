const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

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
        let printWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        const htmlContent = `
            <html>
                <head>
                    <style>
                        @page { 
                            size: 100mm 148mm; 
                            margin: 0; 
                        }
                        body, html { 
                            margin: 0; 
                            padding: 0; 
                            width: 100mm; 
                            height: 148mm; 
                            overflow: hidden; 
                            background-color: white; 
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        img { 
                            max-width: 100%; 
                            max-height: 100%; 
                            object-fit: contain; 
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <img src="${imageSrc}" />
                </body>
            </html>
        `;

        printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

        printWindow.webContents.on('did-finish-load', () => {
            const printOptions = {
                silent: true,
                printBackground: true,
                deviceName: printerName || '',
                margins: { marginType: 'none' },
                pageSize: { width: 100000, height: 148000 }, // 100x148mm in microns
                landscape: false
            };

            printWindow.webContents.print(printOptions, (success, failureReason) => {
                console.log('Print result:', success, failureReason);
                printWindow.close();
                resolve({ success, failureReason });
            });
        });
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
