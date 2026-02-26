import { EraData } from '../types';

export const applyEraStamp = (imageSrc: string, era: EraData): Promise<string> => {
    return new Promise((resolve) => {
        let assetsLoaded = 0;
        const totalAssets = 3; // Generated Image + Frame + Logo

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

        const processComposition = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(imageSrc);
                return;
            }

            // Fixed canvas size for portrait
            canvas.width = 1080;
            canvas.height = 1920;

            // 1. Draw Main Image - Background Layer
            // Fill the entire canvas area with the generated photo
            const imageScale = Math.max(canvas.width / mainImage.width, canvas.height / mainImage.height);
            const scaledWidth = mainImage.width * imageScale;
            const scaledHeight = mainImage.height * imageScale;

            const drawX = (canvas.width - scaledWidth) / 2;
            const drawY = (canvas.height - scaledHeight) / 2;

            ctx.drawImage(mainImage, drawX, drawY, scaledWidth, scaledHeight);

            // 2. Draw Frame - Top Layer
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

            // 3. Draw Logo - Overlay Layer
            const logoWidth = 210;
            const logoHeight = logoImg.height * (logoWidth / logoImg.width);
            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = 160; // Adjusted for new size to sit elegantly

            ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

            resolve(canvas.toDataURL('image/png', 0.9));
        };
    });
};
