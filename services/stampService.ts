import { EraData } from '../types';

export const applyEraStamp = (imageSrc: string, era: EraData, forPrinting: boolean = true): Promise<string> => {
    return new Promise((resolve) => {
        let assetsLoaded = 0;
        const totalAssets = 6; // Generated Image + Frame + Logo + Powered By + Lantern + 3 Logos

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
        const threeLogosImg = createSafeImage('./3 logos.png', true);

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
            // - Top Margin: 90px (Increase to clear printer crop @ top)
            // - Bottom Margin: 40px (User confirmed this is perfect)
            // For Digital version (forPrinting = false), we use 0 margins
            const topMargin = forPrinting ? 90 : 0;
            const bottomMargin = forPrinting ? 40 : 0;
            const safeH = 1800 - topMargin - bottomMargin;

            // 1. Draw Main Image with Clipping
            //    Arch inner width is 1076px for a 1200px frame
            const archInnerWidth = 1076;
            const archSideInset = (canvas.width - archInnerWidth) / 2;
            const archTopOffset = topMargin;

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

            // 2. Draw Frame - Shifted down for printing
            ctx.drawImage(frameImg, 0, topMargin, canvas.width, safeH);

            // 3. Draw Lantern
            const lanternWidth = 180;
            const lanternHeight = lanternImg.height * (lanternWidth / lanternImg.width);
            const lanternX = 40;
            const lanternY = topMargin - 5;

            ctx.drawImage(lanternImg, lanternX, lanternY, lanternWidth, lanternHeight);

            // 4. Draw Ramadan Kareem Logo
            const logoWidth = 180;
            const logoHeight = logoImg.height * (logoWidth / logoImg.width);
            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = topMargin + 130;

            ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

            // 5. Draw Powered By Logo (Bottom Right)
            const pWidth = 120;
            const pHeight = poweredByImg.height * (pWidth / poweredByImg.width);
            const pX = canvas.width - pWidth - 90;
            const pY = topMargin + safeH - pHeight - 25;

            ctx.drawImage(poweredByImg, pX, pY, pWidth, pHeight);

            // 6. Draw 3 Logos (Bottom Left)
            // Positioning it symmetrically to the Powered By logo
            const threeLogosWidth = 500; // Increased by 50% from 180
            const threeLogosHeight = threeLogosImg.height * (threeLogosWidth / threeLogosImg.width);
            const tlX = 80;
            const tlY = topMargin + safeH - threeLogosHeight - 70;

            ctx.drawImage(threeLogosImg, tlX, tlY, threeLogosWidth, threeLogosHeight);

            resolve(canvas.toDataURL('image/png', 0.9));
        };
    });
};
