export enum AppScreen {
  SPLASH = 'SPLASH',
  ERA_SELECTION = 'ERA_SELECTION',
  CAMERA = 'CAMERA',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export enum EraId {
  LANTERN_MAKER = 'LANTERN_MAKER',
  RAMADAN_DRUMMER = 'RAMADAN_DRUMMER',
  KUNAFA_MAKER = 'KUNAFA_MAKER',
  EGYPTIAN_LADY = 'EGYPTIAN_LADY',
  CANNON_OFFICER = 'CANNON_OFFICER',
  DESERT_WANDERER = 'DESERT_WANDERER',
}

export interface Scenery {
  prompt: string;
  maleClothingIds: string[];
  femaleClothingIds: string[];
}

export interface EraData {
  id: EraId;
  name: string;
  description: string;
  previewImage: string;
  scenery: Scenery[];
  frames: string[];
  characters?: string[];
}

export interface FaceDetectionResult {
  maleCount: number;
  femaleCount: number;
  childCount: number;
  totalPeople: number;
}