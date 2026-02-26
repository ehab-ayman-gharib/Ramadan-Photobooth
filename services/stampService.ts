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

            // Fixed canvas size for portrait (1080x1920)
            canvas.width = 1080;
            canvas.height = 1920;

            // 1. Draw Main Image - Figma-aligned layout:
            //    Scale to arch inner width, anchor image to top of arch opening.
            //    Matches Figma spec: image width 968px in 1080 canvas, top-anchored.
            const archSideInset = 56;  // ~56px each side (1080 - 968) / 2
            const archTopOffset = 0;   // anchored to very top of canvas
            const archInnerWidth = canvas.width - archSideInset * 2; // 968px

            // Scale image so its width fills the arch inner width
            const imageScale = archInnerWidth / mainImage.width;
            const scaledWidth = archInnerWidth;
            const scaledHeight = mainImage.height * imageScale;

            const drawX = archSideInset; // aligned to arch left edge
            const drawY = archTopOffset; // anchored to top of arch opening

            ctx.drawImage(mainImage, drawX, drawY, scaledWidth, scaledHeight);

            // 2. Draw Frame - Top Layer
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

            // 3. Draw Lantern - Top Left (Fixed "Stamp")
            const lanternWidth = 160;
            const lanternHeight = lanternImg.height * (lanternWidth / lanternImg.width);
            const lanternX = 35;
            const lanternY = -5;

            ctx.drawImage(lanternImg, lanternX, lanternY, lanternWidth, lanternHeight);

            // 4. Draw Ramadan Kareem Logo - Top Center
            const logoWidth = 160;
            const logoHeight = logoImg.height * (logoWidth / logoImg.width);
            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = 120;

            ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

            // 5. Draw Powered By Logo - Bottom Right area "Stamp"
            const pWidth = 110;
            const pHeight = poweredByImg.height * (pWidth / poweredByImg.width);
            const pX = canvas.width - pWidth - 150;
            const pY = canvas.height - pHeight - 30;

            ctx.drawImage(poweredByImg, pX, pY, pWidth, pHeight);

            resolve(canvas.toDataURL('image/png', 0.9));
        };
    });
};
