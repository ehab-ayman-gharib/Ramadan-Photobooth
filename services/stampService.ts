import { EraData } from '../types';

export const applyEraStamp = (imageSrc: string, era: EraData): Promise<string> => {
    return new Promise((resolve) => {
        const hasFrame = era.frames && era.frames.length > 0;

        let assetsLoaded = 0;
        const totalAssets = 2 + (hasFrame ? 1 : 0); // Main Image + Background + Frame (if exists)

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

        // Background selection - using generic background for all Ramadan eras
        const backgroundPath = './Backgrounds/Generic-Background.jpg';
        const backgroundImg = createSafeImage(backgroundPath, true);

        // Frame selection (top layer)
        const frameImg = hasFrame ? createSafeImage(era.frames[0]) : null;

        const processComposition = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(imageSrc);
                return;
            }

            // Fixed canvas size based on background requirements: 1080 x 1920
            canvas.width = 1080;
            canvas.height = 1920;

            // 1. Draw Background - BASE layer
            ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

            // 2. Draw Main Image - MIDDLE layer
            // The AI-generated image should fit INSIDE the frame's transparent center
            // Make it smaller than the frame so the decorative border extends beyond the photo
            const imageDisplayWidth = canvas.width * 0.75;  // Image at 75% of canvas
            const imageDisplayHeight = canvas.height * 0.75;

            // Calculate scaling to fit the image within the display area while maintaining aspect ratio
            const imageScale = Math.min(imageDisplayWidth / mainImage.width, imageDisplayHeight / mainImage.height);
            const scaledImageWidth = mainImage.width * imageScale;
            const scaledImageHeight = mainImage.height * imageScale;

            // Center the image on the canvas
            const imageX = (canvas.width - scaledImageWidth) / 2;
            const imageY = (canvas.height - scaledImageHeight) / 2;

            ctx.drawImage(mainImage, imageX, imageY, scaledImageWidth, scaledImageHeight);

            // 3. Draw Frame - TOP layer (larger than the image to create border effect)
            if (hasFrame && frameImg) {
                // Frame is drawn LARGER than the image (92% vs 85%)
                // This creates the effect of the photo sitting inside the decorative frame
                const frameDisplayWidth = canvas.width * 0.92;  // Frame at 92% of canvas
                const frameDisplayHeight = canvas.height * 0.92;

                const frameScale = Math.min(frameDisplayWidth / frameImg.width, frameDisplayHeight / frameImg.height);
                const scaledFrameWidth = frameImg.width * frameScale;
                const scaledFrameHeight = frameImg.height * frameScale;

                const frameX = (canvas.width - scaledFrameWidth) / 2;
                const frameY = (canvas.height - scaledFrameHeight) / 2;

                ctx.drawImage(frameImg, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
            }

            // Stamping/Branding logic remains commented out per user request
            /*
            const logoImage = createSafeImage(['./Logos/Gold-Logo.png', './Logos/Original-Logo.png'][Math.floor(Math.random() * 2)]);
            const logoInternalPadding = targetWidth * 0.05;
            const logoScale = 0.385; 
            const logoWidth = targetWidth * logoScale;
            const logoHeight = logoWidth * (logoImage.height / logoImage.width);
            const logoX = targetX + logoInternalPadding;
            const logoY = targetY + logoInternalPadding;
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
            */

            resolve(canvas.toDataURL('image/png', 0.9));
        };
    });
};
