import { EraData } from '../types';

export const applyEraStamp = (imageSrc: string, era: EraData): Promise<string> => {
    return new Promise((resolve) => {
        let assetsLoaded = 0;
        const totalAssets = 5; // Generated Image + Frame + Logo + Powered By + Lantern

        const onAssetLoad = () => {
            assetsLoaded++;
            if (assetsLoaded === totalAssets) {
                processComposition();
            }
        };

        const createSafeImage = (src: string, isEssential = false) => {
            const img = new Image();
            if (!src.startsWith('data:')) {
                img.crossOrigin = "anonymous";
            }
            img.onload = onAssetLoad;
            img.onerror = (err) => {
                console.error(`[Composition] Failed to load image: ${src}`, err);
                if (isEssential) {
                    resolve(imageSrc);
                } else {
                    onAssetLoad();
                }
            };
            img.src = src;
            return img;
        };

        const mainImage = createSafeImage(imageSrc, true);
        const frameImg = createSafeImage('./Result-Screen.png', true);
        const logoImg = createSafeImage('./Splash-Screen/Ramadan-Kareem.png', true);
        const poweredByImg = createSafeImage('./Powered_By_5D.png', true);
        const lanternImg = createSafeImage('./Lantern.png', true);

        const processComposition = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(imageSrc);
                return;
            }

            // Fixed canvas size for 4x6 portrait (1200x1800)
            canvas.width = 1200;
            canvas.height = 1800;

            // SELPHY Strategy: 
            // - NO horizontal margin (Full Bleed left/right)
            // - 40px vertical margin (Protect top frame + bottom logo from perforation)
            const vMargin = 40;
            const safeH = canvas.height - (vMargin * 2); // 1720

            // 1. Draw Main Image with Clipping
            //    Arch inner width is 1076px for a 1200px frame
            const archInnerWidth = 1076;
            const archSideInset = (canvas.width - archInnerWidth) / 2;
            const archTopOffset = vMargin;

            const imageScale = archInnerWidth / mainImage.width;
            const scaledWidth = archInnerWidth;
            const scaledHeight = mainImage.height * imageScale;

            ctx.save();
            // Create a clipping rectangle matching the frame's opening to avoid "leaks" at the bottom
            ctx.beginPath();
            ctx.rect(archSideInset, archTopOffset, archInnerWidth, safeH);
            ctx.clip();

            ctx.drawImage(mainImage, archSideInset, archTopOffset, scaledWidth, scaledHeight);
            ctx.restore();

            // 2. Draw Frame - Full Width (1200), but vertically inset (safeH)
            ctx.drawImage(frameImg, 0, vMargin, canvas.width, safeH);

            // 3. Draw Lantern
            const lanternWidth = 180;
            const lanternHeight = lanternImg.height * (lanternWidth / lanternImg.width);
            const lanternX = 40;
            const lanternY = vMargin - 5;

            ctx.drawImage(lanternImg, lanternX, lanternY, lanternWidth, lanternHeight);

            // 4. Draw Ramadan Kareem Logo
            const logoWidth = 180;
            const logoHeight = logoImg.height * (logoWidth / logoImg.width);
            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = vMargin + 130;

            ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

            // 5. Draw Powered By Logo
            const pWidth = 120;
            const pHeight = poweredByImg.height * (pWidth / poweredByImg.width);
            const pX = canvas.width - pWidth - 160;
            const pY = vMargin + safeH - pHeight - 35;

            ctx.drawImage(poweredByImg, pX, pY, pWidth, pHeight);

            resolve(canvas.toDataURL('image/png', 0.9));
        };
    });
};
