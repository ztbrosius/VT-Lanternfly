// ==========================================
// Navigation & View Types
// ==========================================
export type Tab = 'map' | 'learn' | 'teams' | 'me';
export type View = Tab | 'capture' | 'verifying' | 'result';
export type Outcome = 'confirmed' | 'native' | 'uncertain';

// ==========================================
// Interfaces (Data Models)
// ==========================================

// Represents a spotted lanternfly life stage
export interface LifeStage {
    name: string;
    activeMonths: string;
    description: string;
}

// Represents a single question inside a learning quiz
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

// Represents a lesson module in the Learn tab
export interface Lesson {
    title: string;
    eyebrow: string;
    summary: string;
    questions: QuizQuestion[];
}

// Represents a team on the leaderboard
export interface LeaderboardTeam {
    name: string;
    points: number;
}

// ==========================================
// Exported Constants (Static Data)
// ==========================================

export const lanternflyStages: LifeStage[] = [
    { name: 'Egg mass', activeMonths: 'Sep–Jun', description: 'Gray, mud-like patches laid in rows on smooth outdoor surfaces.' },
    { name: 'Black nymph', activeMonths: 'Apr–Jul', description: 'Tiny black body with bright white spots; quick and wingless.' },
    { name: 'Red nymph', activeMonths: 'Jul–Sep', description: 'Vivid red with black bands and white dots before adulthood.' },
    { name: 'Adult', activeMonths: 'Jul–Dec', description: 'Gray spotted forewings hide striking red-and-black hindwings.' },
];

export const appLessons: Lesson[] = [
    {
        title: 'Life Stages',
        eyebrow: 'LESSON 1',
        summary: 'Learn how egg masses, black nymphs, red nymphs, and adults change through the year.',
        questions: [
            { question: 'Which stage has gray spotted wings?', options: ['Adult', 'Egg mass', 'Black nymph'], correctAnswerIndex: 0 },
            { question: 'When are egg masses commonly visible?', options: ['Only July', 'Sep–Jun', 'Only April'], correctAnswerIndex: 1 },
        ],
    },
    {
        title: 'Host Trees',
        eyebrow: 'LESSON 2',
        summary: 'Identify the trees where lanternflies feed and where egg masses are often found.',
        questions: [
            { question: 'Which is a favorite host?', options: ['Tree of Heaven', 'Dogwood', 'Pine'], correctAnswerIndex: 0 },
            { question: 'What can identify Tree of Heaven?', options: ['Needle clusters', 'Burnt peanut butter smell', 'White flowers'], correctAnswerIndex: 1 },
        ],
    },
    {
        title: 'Look-alikes and Impact',
        eyebrow: 'LESSON 3',
        summary: 'Protect native insects and understand how lanternflies damage Virginia plants.',
        questions: [
            { question: 'What should you do when unsure?', options: ['Report and leave it alone', 'Remove it', 'Ignore safety'], correctAnswerIndex: 0 },
            { question: 'Sugary lanternfly waste can cause…', options: ['Sooty mold', 'Frost', 'Drought'], correctAnswerIndex: 0 },
        ],
    },
];