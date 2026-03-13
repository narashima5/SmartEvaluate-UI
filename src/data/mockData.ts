export type Domain =
    | 'IoT & Smart Cities'
    | 'AI / Generative AI'
    | 'Climate & Environmental Intelligence'
    | 'Disaster Prediction & Response'
    | 'Cybersecurity'
    | 'Healthcare Technology'
    | 'Open Innovation';

export interface Team {
    Timestamp?: number;
    'Team Name'?: string;
    'Team Leader Name'?: string;
    Year?: number | string;
    Department?: string;
    Email?: string;
    'Phone Number'?: number | string;

    'Team Member 1 Name'?: string;
    'Team Member 1 Year'?: string;
    'Team Member 1 Department'?: string;
    'Team Member 1 Email Id'?: string;
    'Team Member 1 Phone Number'?: string;

    'Team Member 2 Name'?: string;
    'Team Member 2 Year'?: string;
    'Team Member 2 Department'?: string;
    'Team Member 2 Email Id'?: string;
    'Team Member 2 Phone Number'?: string;

    'Team Member 3 Name'?: string;
    'Team Member 3 Year'?: string;
    'Team Member 3 Department'?: string;
    'Team Member 3 Email Id'?: string;
    'Team Member 3 Phone Number'?: string;

    'Team Member 4 Name'?: string;
    'Team Member 4 Year'?: string;
    'Team Member 4 Department'?: string;
    'Team Member 4 Email Id'?: string;
    'Team Member 4 Phone Number'?: string;

    'Team Member 5 Name'?: string;
    'Team Member 5 Year'?: string;
    'Team Member 5 Department'?: string;
    'Team Member 5 Email Id'?: string;
    'Team Member 5 Phone Number'?: string;

    Domain?: string;
    'Order ID'?: number | string;
    'Ticket ID'?: number | string;

    // We still need an id for React mapping, and name for basic fallbacks
    id: string;
    name?: string;

    // Evaluation fields
    problemStatement?: string;
    r1_1?: number; r1_2?: number; r1_3?: number; r1_4?: number;
    r2_1?: number; r2_2?: number; r2_3?: number; r2_4?: number;
    r3_1?: number; r3_2?: number; r3_3?: number; r3_4?: number;
    isProblemStatementLocked?: boolean;
    isRound1Locked?: boolean;
    isRound2Locked?: boolean;
    isRound3Locked?: boolean;

    // Legacy fields for mock data and fallback
    members?: string[];
    domain?: Domain;
    location?: string;
    college?: string;
    leaderEmail?: string;
    leaderPhone?: string;
}

export const EVALUATION_CRITERIA: Record<Domain, { r1: string[], r2: string[], r3: string[] }> = {
    'IoT & Smart Cities': {
        r1: ['Understanding the issues', 'Hardware Knowledge', 'Idea Preparation', 'Innovation / Feasibility'],
        r2: ['System Architecture Design', 'Hardware Integration', 'Prototype Implementation (min 50%)', 'Practical Usage'],
        r3: ['Working IOT Model 100%', 'Technical Implementation', 'Overall Explanation', 'Scalability in Real world']
    },
    'AI / Generative AI': {
        r1: ['Understanding the give Statement', 'Concept Knowledge of Generative AI', 'Idea Preparation', 'Innovation / Feasibility'],
        r2: ['System Architecture Design', 'Algorithm Implementation', 'Prototype Implementation (min 50%)', 'Data Set Selection & Processing'],
        r3: ['Working Model 100%', 'Technical Implementation', 'Overall Explanation', 'Scalability in Real world']
    },
    'Climate & Environmental Intelligence': {
        r1: ['Understanding the issues', 'Sustainability concept', 'Idea Preparation', 'Innovation / Feasibility'],
        r2: ['System Architecture Design', 'Sustainability Implementation', 'Prototype Implementation (min 50%)', 'Environmental data usage'],
        r3: ['Working Model 100%', 'Technical Implementation', 'Overall Explanation', 'Scalability in Real world']
    },
    'Disaster Prediction & Response': {
        r1: ['Understanding the issues', 'Sustainability concept', 'Idea Preparation', 'Innovation / Feasibility'],
        r2: ['System Architecture Design', 'Sustainability Implementation', 'Prototype Implementation (min 50%)', 'Dataset Collection & Strategies'],
        r3: ['Working Model 100%', 'Technical Implementation', 'Overall Explanation', 'Scalability in Real world']
    },
    'Open Innovation': {
        r1: ['Understanding the Problem', 'Concept Analysis', 'Idea Preparation', 'Innovation / Feasibility'],
        r2: ['System Architecture Design', 'Technology Integration', 'Prototype Implementation (min 50%)', 'Creativity in solution'],
        r3: ['Working Model 100%', 'Technical Implementation', 'Overall Explanation', 'Scalability in Real world']
    },
    'Cybersecurity': {
        r1: ['Cyber Security Threads', 'Security based Tools Knowledge', 'Idea Preparation', 'Innovation / Feasibility'],
        r2: ['System Architecture Design', 'Thread Detection approach', 'Prototype Implementation (min 50%)', 'Implementation of Security Features'],
        r3: ['Working Model 100%', 'Technical Implementation', 'Overall Explanation', 'Scalability in Real world']
    },
    'Healthcare Technology': {
        r1: ['Understanding Healthcare issues', 'Medical Solution Idea', 'Knowledge of Health & Medical', 'Innovation / Feasibility'],
        r2: ['System Architecture Design', 'Logic Implementation', 'Prototype Implementation (min 50%)', 'Data Safety Measure Implementation'],
        r3: ['Working Model 100%', 'Technical Implementation', 'Overall Explanation', 'Scalability in Real world']
    }
};

export const mockTeams: Team[] = [];

export const domains: Domain[] = [
    'AI / Generative AI',
    'Cybersecurity',
    'IoT & Smart Cities',
    'Disaster Prediction & Response',
    'Healthcare Technology',
    'Climate & Environmental Intelligence',
    'Open Innovation'
];

export const parseDomain = (rawDomain: string | undefined): Domain => {
    if (!rawDomain) return 'Open Innovation';

    const lower = rawDomain.toLowerCase();

    if (lower.includes('iot') || lower.includes('smart')) return 'IoT & Smart Cities';
    if (lower.includes('ai') || lower.includes('generative')) return 'AI / Generative AI';
    if (lower.includes('climate') || lower.includes('environment')) return 'Climate & Environmental Intelligence';
    if (lower.includes('disaster')) return 'Disaster Prediction & Response';
    if (lower.includes('cyber') || lower.includes('security')) return 'Cybersecurity';
    if (lower.includes('health') || lower.includes('medical')) return 'Healthcare Technology';

    return 'Open Innovation';
};
