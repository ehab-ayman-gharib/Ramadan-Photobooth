import { EraData, EraId } from './types';

export const SHARED_PROMPT_INSTRUCTIONS = `A hyper-realistic, high-resolution portrait-oriented photo. Each person’s appearance must accurately match the source photo, fully preserving identity, natural skin tone, ethnic features, gender, age, facial structure, and expression. The final image should look like a modern professional photoshoot with an authentic historical theme. Everything must appear natural, cohesive, and true to the original individuals. No cartoon style, no distortion.`;

export const IDENTITY_PRESERVATION_GUIDE = `REQUIREMENTS:
- KEEP the original faces and identity visible and recognizable. Do NOT alter features.
- Change ONLY clothing, hair, and accessories to be historically accurate.
- Photorealistic, high quality, 9:16 portrait.
- Lighting must be cinematic, volumetric, and natural, casting realistic shadows on the clothing layers.`;

export const ERAS: EraData[] = [
  {
    id: EraId.LANTERN_MAKER,
    name: "Ramadan Lantern Maker",
    description: "صانع الفوانيس - The traditional craftsman who creates beautiful Ramadan lanterns",
    previewImage: "./Ramadan/Lantern-Maker-Preview.png",
    scenery: [
      {
        prompt: "A warm, atmospheric workshop filled with colorful handmade Ramadan lanterns (Fanous). The subject stands among hanging lanterns of various sizes, with warm golden light filtering through stained glass. Traditional tools and brass decorations visible in the background. Authentic Egyptian craftsmanship atmosphere.",
        maleClothingIds: [
          "Traditional Egyptian craftsman: A comfortable cotton Galabeya in earthy tones (beige or light brown), with a simple leather apron tied at the waist. A small white skullcap (Taqiyah). Footwear: Simple leather sandals.",
          "Master artisan: A knee-length cotton tunic in cream color, with rolled-up sleeves showing work. A leather tool belt with brass fittings. A patterned headscarf wrapped loosely. Footwear: Comfortable work shoes."
        ],
        femaleClothingIds: [
          "Traditional craftswoman: A flowing cotton dress in warm colors (terracotta or mustard), with a colorful embroidered vest. A light headscarf with traditional patterns. Footwear: Comfortable slippers.",
          "Artisan helper: A practical long tunic over loose pants, in natural linen colors. A simple headscarf tied back for work. Decorative beaded accessories. Footwear: Flat shoes."
        ]
      }
    ],
    frames: ["./Frames/Ramadan/1.png"]
  },
  {
    id: EraId.RAMADAN_DRUMMER,
    name: "The Ramadan Drummer",
    description: "المسحراتي - The traditional dawn drummer who wakes people for Suhoor",
    previewImage: "./Ramadan/Drummer-Preview.png",
    scenery: [
      {
        prompt: "A magical pre-dawn scene in a traditional Egyptian neighborhood. The subject stands in a narrow alley with old buildings, holding a traditional drum (Tabla). Soft lantern light illuminates the scene. The atmosphere is mystical and peaceful, capturing the essence of Ramadan nights.",
        maleClothingIds: [
          "Traditional Mesaharati: A long striped Galabeya in traditional colors (blue and white or brown and cream), with a wide fabric belt. A traditional embroidered vest. A white turban or Taqiyah. Carrying a large drum (Tabla). Footwear: Traditional leather shoes.",
          "Night caller: A flowing dark-colored Galabeya with decorative trim, a colorful sash around the waist. A patterned headscarf. Holding a traditional lantern and drum stick. Footwear: Comfortable walking shoes."
        ],
        femaleClothingIds: [
          "Traditional supporter: A long flowing dress in rich jewel tones (deep purple or emerald), with gold embroidery. A decorative headscarf with coins or beads. Traditional jewelry. Footwear: Embroidered slippers.",
          "Community helper: A comfortable long tunic over pants in coordinating colors, with a decorative shawl. A simple but elegant headscarf. Footwear: Flat shoes."
        ]
      }
    ],
    frames: ["./Frames/Ramadan/1.png"]
  },
  {
    id: EraId.KUNAFA_MAKER,
    name: "Kunafa Dessert Maker",
    description: "حلواني الكنافة - The master dessert chef specializing in traditional Ramadan sweets",
    previewImage: "./Ramadan/Kunafa-Preview.png",
    scenery: [
      {
        prompt: "A bustling traditional Egyptian sweet shop (Halawany). The subject stands behind a display of golden Kunafa, Qatayef, and other Ramadan desserts. Copper trays gleam, and the atmosphere is warm and inviting. Decorative tiles and traditional architecture visible in the background.",
        maleClothingIds: [
          "Master Halawany: A clean white chef's coat or apron over a light-colored Galabeya. A white chef's hat or simple white cap. Footwear: Clean white shoes.",
          "Traditional sweet maker: A comfortable cotton tunic in light colors, with a decorative apron featuring traditional patterns. A small white cap. Footwear: Comfortable work shoes."
        ],
        femaleClothingIds: [
          "Sweet shop owner: A elegant long dress in warm colors (rose or cream), with a decorative apron featuring embroidery. A stylish headscarf in coordinating colors. Traditional jewelry. Footwear: Comfortable elegant shoes.",
          "Dessert artisan: A practical tunic and pants set in pastel colors, with a colorful apron. A simple headscarf tied back. Footwear: Flat comfortable shoes."
        ]
      }
    ],
    frames: ["./Frames/Ramadan/1.png"]
  },
  {
    id: EraId.EGYPTIAN_LADY,
    name: "The Egyptian Lady",
    description: "الهانم المصرية - The elegant Egyptian lady in traditional festive attire",
    previewImage: "./Ramadan/Lady-Preview.png",
    scenery: [
      {
        prompt: "An elegant traditional Egyptian home interior during Ramadan. The subject sits or stands in a beautifully decorated room with traditional furniture, colorful cushions, and Ramadan decorations. Ornate mashrabiya screens filter soft light. The atmosphere is refined and festive.",
        maleClothingIds: [
          "Elegant gentleman: A refined long Galabeya in rich colors (navy or burgundy), with subtle embroidery. A matching vest or jacket. A traditional Taqiyah or turban. Footwear: Polished leather shoes.",
          "Distinguished host: A formal cotton Kaftan with decorative buttons and trim, in elegant colors. A silk scarf draped over shoulders. Footwear: Traditional formal shoes."
        ],
        femaleClothingIds: [
          "Elegant Hanem: A luxurious long dress or Kaftan in rich fabrics (velvet or silk), with intricate embroidery and beading. An elegant headscarf in coordinating colors, styled fashionably. Statement traditional jewelry (gold necklaces, bracelets). Footwear: Elegant heeled slippers.",
          "Refined lady: A flowing two-piece ensemble (long tunic over wide pants) in jewel tones, with gold thread embroidery. A decorative shawl draped elegantly. Traditional accessories. Footwear: Embellished flats."
        ]
      }
    ],
    frames: ["./Frames/Ramadan/1.png"]
  },
  {
    id: EraId.CANNON_OFFICER,
    name: "The Iftar Cannon Officer",
    description: "ضابط المدفع - The officer who fires the traditional Ramadan cannon at sunset",
    previewImage: "./Ramadan/Cannon-Preview.png",
    scenery: [
      {
        prompt: "The Cairo Citadel at sunset during Ramadan. The subject stands near a historic ceremonial cannon with the Cairo skyline in the background. The sky is painted in warm sunset colors (orange, pink, purple). The atmosphere is majestic and ceremonial, capturing the moment before Iftar.",
        maleClothingIds: [
          "Ceremonial officer: A traditional military-inspired uniform with Egyptian motifs - a fitted jacket with gold braiding and buttons, over matching pants. A traditional fez or military cap. Polished boots. A ceremonial sash.",
          "Cannon keeper: A formal vest over a crisp white shirt and dark pants, with traditional Egyptian decorative elements. A simple cap or turban. Leather boots."
        ],
        femaleClothingIds: [
          "Ceremonial attendant: A elegant long coat in military-inspired style (navy or burgundy) with gold trim, over a flowing dress. A decorative headscarf styled formally. Footwear: Polished boots or formal shoes.",
          "Traditional observer: A refined long dress with a decorative jacket featuring traditional embroidery. An elegant headscarf. Traditional jewelry. Footwear: Elegant flats."
        ]
      }
    ],
    frames: ["./Frames/Ramadan/1.png"]
  },
  {
    id: EraId.DESERT_WANDERER,
    name: "The Desert Wanderer",
    description: "رحالة الصحراء - The traveler experiencing Ramadan in the Egyptian desert",
    previewImage: "./Ramadan/Desert-Preview.png",
    scenery: [
      {
        prompt: "A serene Egyptian desert landscape at dusk during Ramadan. The subject stands near a traditional Bedouin tent with colorful rugs and cushions. Sand dunes and palm trees in the background. The sky transitions from day to night with the first stars appearing. A peaceful, spiritual atmosphere.",
        maleClothingIds: [
          "Bedouin traveler: A flowing traditional Bedouin robe (Thobe) in natural desert colors (white, cream, or light brown), with a patterned headscarf (Keffiyeh) secured with an Agal. A leather belt with traditional pouches. Footwear: Sturdy leather sandals.",
          "Desert guide: A comfortable long tunic with a decorative vest, loose pants. A wrapped turban in traditional style. A leather shoulder bag. Footwear: Desert boots."
        ],
        femaleClothingIds: [
          "Bedouin woman: A flowing traditional dress in rich colors (deep blue, burgundy, or black) with colorful embroidery and patterns. A decorative headscarf with coins or beading. Traditional silver jewelry. Footwear: Embroidered slippers.",
          "Desert traveler: A practical long tunic over loose pants in earth tones, with a colorful shawl. A wrapped headscarf in traditional Bedouin style. Leather accessories. Footwear: Comfortable sandals."
        ]
      }
    ],
    frames: ["./Frames/Ramadan/1.png"]
  }
];