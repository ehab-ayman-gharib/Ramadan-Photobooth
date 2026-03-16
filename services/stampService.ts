import { EraData } from '../types';

export const applyEraStamp = (imageSrc: string, era: EraData, forPrinting: boolean = true): Promise<string> => {
    return new Promise((resolve) => {
        let assetsLoaded = 0;
        const totalAssets = 7; // Generated Image + Frame + Logo + Powered By + Lantern + 3 Logos + Flowers

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

        // Use era-specific frame if available, otherwise fallback to the default frame
        const eraFrame = era.frames && era.frames.length > 0 && !era.frames[0].includes('Frames/Ramadan/1.png')
            ? era.frames[0]
            : './Result-Screen.png';

        const mainImage = createSafeImage(imageSrc, true);
        const frameImg = createSafeImage(eraFrame, true);
        const logoImg = createSafeImage('./Splash-Screen/Ramadan-Kareem.png', true);
        const poweredByImg = createSafeImage('./Powered_By_5D.png', true);
        const lanternImg = createSafeImage('./Lantern.png', true);
        const threeLogosImg = createSafeImage('./3 logos.png', true);
        const flowersImg = createSafeImage('./Flowers-Wedding-Frame.png', true);

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

            // Check if we are using a JPG frame (which covers everything) or if it's the Snap a Memory era
            const isSnapEra = era.id.includes('SNAP_A_MEMORY') || eraFrame.toLowerCase().endsWith('.jpg');

            if (isSnapEra) {
                // 1. Draw Frame as Background
                ctx.drawImage(frameImg, 0, topMargin, canvas.width, safeH);

                // 2. Draw Main Image on TOP (Premium Wider Portrait)
                const targetW = 1000; // Wider to fill more of the frame
                const targetH = 1300; // Taller for more presence, but keeping safe gap
                const x = (canvas.width - targetW) / 2;
                const y = topMargin + 140; // High enough to clear floral decor

                // Crop logic from 9:16 to wider portrait box (No more stretching!)
                const inputAspect = mainImage.width / mainImage.height;
                const targetAspect = targetW / targetH;

                let sW, sH, sX, sY;
                if (inputAspect > targetAspect) {
                    sH = mainImage.height;
                    sW = sH * targetAspect;
                    sX = (mainImage.width - sW) / 2;
                    sY = 0;
                } else {
                    sW = mainImage.width;
                    sH = sW / targetAspect;
                    sX = 0;
                    sY = (mainImage.height - sH) / 2;
                }

                // Add border and Draw ONCE
                ctx.fillStyle = 'white';
                ctx.fillRect(x - 2, y - 2, targetW + 4, targetH + 4);
                ctx.drawImage(mainImage, sX, sY, sW, sH, x, y, targetW, targetH);

                // 2b. Draw Flowers (Top-Left)
                const flowerW = 350;
                const flowerH = flowersImg.height * (flowerW / flowersImg.width);
                ctx.drawImage(flowersImg, -80, topMargin - 90, flowerW, flowerH);
            } else {
                // 1. Draw Main Image with Clipping (Standard Arch logic)
                const archInnerWidth = 1076;
                const archSideInset = (canvas.width - archInnerWidth) / 2;
                const archTopOffset = topMargin;

                const imageScale = archInnerWidth / mainImage.width;
                const scaledWidth = archInnerWidth;
                const scaledHeight = mainImage.height * imageScale;

                ctx.save();
                ctx.beginPath();
                ctx.rect(archSideInset, archTopOffset, archInnerWidth, safeH);
                ctx.clip();
                ctx.drawImage(mainImage, archSideInset, archTopOffset, scaledWidth, scaledHeight);
                ctx.restore();

                // 2. Draw Frame - Shifted down for printing (Overlay style)
                ctx.drawImage(frameImg, 0, topMargin, canvas.width, safeH);
            }

            if (!isSnapEra) {
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
            }

            // 6. Draw 3 Logos (Bottom Left)
            // Positioning it symmetrically to the Powered By logo
            const threeLogosWidth = 500; // Increased by 50% from 180
            const threeLogosHeight = threeLogosImg.height * (threeLogosWidth / threeLogosImg.width);
            const tlX = 80;
            const tlY = topMargin + safeH - threeLogosHeight - 70;

            // ctx.drawImage(threeLogosImg, tlX, tlY, threeLogosWidth, threeLogosHeight);

            resolve(canvas.toDataURL('image/png', 0.9));
        };
    });
};
