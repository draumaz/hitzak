export interface SeedSection {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  color: string;
  icon: string;
}

export interface SeedUnit {
  id: number;
  sectionId: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  color: string;
  guidebook: string;
}

export interface SeedRing {
  id: number;
  unitId: number;
  title: string;
  description: string;
  order: number;
  totalLevels: number;
  isUnitReview: boolean;
  icon: string;
}

export interface SeedLesson {
  id: number;
  unitId: number;
  ringId: number;
  level: number;
  title: string;
  order: number;
  xpReward: number;
  isUnitReview: boolean;
}

export interface SeedChallengeOption {
  id: number;
  text: string;
  correct: boolean;
  imageSrc?: string;
  audioSrc?: string;
  order?: number;
  pairMatchingKey?: string;
}

export interface SeedChallenge {
  id: number;
  lessonId: number;
  type: "SELECT" | "ASSIST" | "TRANSLATE" | "MATCH" | "LISTEN";
  question: string;
  prompt?: string;
  order: number;
  audioSrc?: string;
  audioText?: string;
  grammarTip?: string;
  options: SeedChallengeOption[];
}

export interface SeedData {
  languages: Array<{
    id: string;
    name: string;
    nativeName: string;
    flagEmoji: string;
    isSupported: boolean;
  }>;
  courses: Array<{
    id: number;
    title: string;
    sourceLanguageId: string;
    targetLanguageId: string;
    imageSrc: string;
    description: string;
  }>;
  sections: SeedSection[];
  units: SeedUnit[];
  rings: SeedRing[];
  lessons: SeedLesson[];
  challenges: SeedChallenge[];
  initialUser: {
    userId: string;
    userName: string;
    userImageSrc: string;
    activeCourseId: number;
    hearts: number;
    points: number;
    streak: number;
    gems: number;
    hasActiveSubscription: boolean;
  };
}
