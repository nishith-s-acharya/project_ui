
export interface MedicationDetails {
    strengths?: string[];
    routes?: string[];
    classes?: string[];
    form?: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    indication: string;
    suitableFor: string[];
    contraindications: string[];
    sideEffects: string[];
    category: string;
    matchScore?: number; // Internal scoring for relevance
    summary?: string;
    details?: MedicationDetails;
    source?: 'api' | 'fallback' | 'knowledge_graph';
}

export interface LifestyleAdvice {
    id: string;
    title: string;
    icon: 'Water' | 'Moon' | 'Sun' | 'Coffee' | 'Check' | 'Alert';
    content: string;
    category: string[];
}

// --- Knowledge Graph Data ---

export const LIFESTYLE_PROTOCOLS: Record<string, LifestyleAdvice[]> = {
    'pain': [
        { id: 'hydration', title: 'Stay Hydrated', icon: 'Water', content: 'Dehydration often worsens headaches. Drink nearly 3L of water daily.', category: ['headache', 'migraine'] },
        { id: 'rest', title: 'Dark Room Rest', icon: 'Moon', content: 'Resting in a quiet, dark room can significantly reduce migraine intensity.', category: ['migraine'] },
        { id: 'compress', title: 'Cold Compress', icon: 'Check', content: 'Apply a cold pack to your forehead for 15 minutes to numb pain.', category: ['headache', 'fever'] }
    ],
    'respiratory': [
        { id: 'steam', title: 'Steam Inhalation', icon: 'Sun', content: 'Inhale steam to loosen mucus and relieve congestion.', category: ['cold', 'flu', 'congestion'] },
        { id: 'honey', title: 'Honey & Tea', icon: 'Coffee', content: 'Warm herbal tea with honey helps soothe a sore throat naturally.', category: ['cough', 'throat'] },
        { id: 'elevate', title: 'Elevate Head', icon: 'Moon', content: 'Sleep with an extra pillow to help drain sinuses.', category: ['congestion', 'sleep'] }
    ],
    'digestive': [
        { id: 'brat', title: 'BRAT Diet', icon: 'Check', content: 'Stick to Bananas, Rice, Applesauce, and Toast for upset stomachs.', category: ['nausea', 'diarrhea'] },
        { id: 'ginger', title: 'Ginger Tea', icon: 'Coffee', content: 'Ginger is a proven natural remedy for settling nausea.', category: ['nausea'] },
        { id: 'upright', title: 'Stay Upright', icon: 'Alert', content: 'Avoid lying down for 2 hours after eating to reduce heartburn.', category: ['heartburn', 'gerd'] }
    ],
    'general': [
        { id: 'rest_gen', title: 'Prioritize Sleep', icon: 'Moon', content: 'Your body heals fastest while you sleep. Aim for 8+ hours.', category: ['flu', 'fever', 'general'] }
    ]
};

export const EXTENDED_MEDICATION_DATABASE: Medication[] = [
    // --- PAIN RELIEF ---
    {
        id: 'tylenol_expl',
        name: 'Acetaminophen (Tylenol)',
        dosage: '500-1000mg',
        frequency: 'Every 6-8 hours',
        indication: 'General pain, headache, fever',
        suitableFor: ['adults', 'children', 'pregnant'],
        contraindications: ['liver disease', 'alcohol use'],
        sideEffects: ['Nausea', 'Liver/jaundice (rarely)'],
        category: 'Pain Relief',
        summary: 'First-line choice for headaches & fever. Safest option for most profles.',
        details: { form: 'Tablet', classes: ['Analgesic'], strengths: ['325mg', '500mg'] }
    },
    {
        id: 'advil_expl',
        name: 'Ibuprofen (Advil)',
        dosage: '200-400mg',
        frequency: 'Every 6-8 hours',
        indication: 'Inflammation, muscle aches, toothache',
        suitableFor: ['adults'],
        contraindications: ['pregnancy', 'stomach ulcers', 'kidney disease', 'asthma'],
        sideEffects: ['Stomach upset', 'Heartburn'],
        category: 'Pain Relief',
        summary: 'Best for inflammation-based pain like sprains or toothaches.',
        details: { form: 'Tablet', classes: ['NSAID'], strengths: ['200mg'] }
    },
    {
        id: 'aleve_expl',
        name: 'Naproxen (Aleve)',
        dosage: '220mg',
        frequency: 'Every 12 hours',
        indication: 'Long-lasting joint pain, menstrual cramps',
        suitableFor: ['adults'],
        contraindications: ['pregnancy', 'stomach ulcers', 'kidney disease'],
        sideEffects: ['Stomach pain', 'Dizziness'],
        category: 'Pain Relief',
        summary: 'Longer acting NSAID. Good for chronic aches or period pain.',
        details: { form: 'Tablet', classes: ['NSAID'], strengths: ['220mg'] }
    },
    {
        id: 'excedrin_expl',
        name: 'Excedrin Migraine',
        dosage: '2 tablets',
        frequency: 'Once every 24 hours',
        indication: 'Migraine headaches',
        suitableFor: ['adults'],
        contraindications: ['pregnancy', 'caffeine sensitivity', 'stomach ulcers'],
        sideEffects: ['Jitters', 'Nausea'],
        category: 'Pain Relief',
        summary: 'Potent mix of Aspirin, Acetaminophen & Caffeine for migraines.',
        details: { form: 'Tablet', classes: ['Combination'], strengths: ['Extra Strength'] }
    },

    // --- COLD & FLU & ALLERGY ---
    {
        id: 'claritin_expl',
        name: 'Loratadine (Claritin)',
        dosage: '10mg',
        frequency: 'Once daily',
        indication: 'Daily allergy maintenance',
        suitableFor: ['adults', 'children'],
        contraindications: ['liver disease'],
        sideEffects: ['Dry mouth', 'Headache'],
        category: 'Allergies',
        summary: 'Non-drowsy 24h relief for dust, pet dander, and pollen.',
        details: { form: 'Tablet', classes: ['Antihistamine'], strengths: ['10mg'] }
    },
    {
        id: 'zyrtec_expl',
        name: 'Cetirizine (Zyrtec)',
        dosage: '10mg',
        frequency: 'Once daily',
        indication: 'Fast-acting allergy relief',
        suitableFor: ['adults', 'children'],
        contraindications: ['kidney disease'],
        sideEffects: ['Mild drowsiness', 'Dry mouth'],
        category: 'Allergies',
        summary: 'Works faster than Claritin but may cause mild drowsiness.',
        details: { form: 'Tablet', classes: ['Antihistamine'], strengths: ['10mg'] }
    },
    {
        id: 'benadryl_expl',
        name: 'Diphenhydramine (Benadryl)',
        dosage: '25-50mg',
        frequency: 'Every 4-6 hours',
        indication: 'Severe allergic reaction, hives, sleep',
        suitableFor: ['adults'],
        contraindications: ['glaucoma', 'driving'],
        sideEffects: ['Marked drowsiness', 'Dizziness'],
        category: 'Allergies',
        summary: 'Strong relief for reactions/hives. Highly sedating.',
        details: { form: 'Capsule', classes: ['Antihistamine'], strengths: ['25mg'] }
    },
    {
        id: 'sudafed_expl',
        name: 'Pseudoephedrine (Sudafed)',
        dosage: '30-60mg',
        frequency: 'Every 4-6 hours',
        indication: 'Severe nasal congestion',
        suitableFor: ['adults'],
        contraindications: ['high blood pressure', 'heart disease', 'anxiety'],
        sideEffects: ['Insomnia', 'Increased heart rate'],
        category: 'Cold & Flu',
        summary: 'Powerful decongestant. Requires ID to purchase.',
        details: { form: 'Tablet', classes: ['Decongestant'], strengths: ['30mg'] }
    },
    {
        id: 'mucinex_expl',
        name: 'Guaifenesin (Mucinex)',
        dosage: '600-1200mg',
        frequency: 'Every 12 hours',
        indication: 'Chest congestion, mucus',
        suitableFor: ['adults', 'pregnant (check doctor)'],
        contraindications: ['persistent chronic cough'],
        sideEffects: ['Nausea', 'Vomiting'],
        category: 'Cold & Flu',
        summary: 'Thins mucus to help cough it up (Expectorant).',
        details: { form: 'Tablet', classes: ['Expectorant'], strengths: ['600mg'] }
    },
    {
        id: 'delsym_expl',
        name: 'Dextromethorphan (Delsym)',
        dosage: '10ml',
        frequency: 'Every 12 hours',
        indication: 'Dry, hacking cough',
        suitableFor: ['adults', 'children'],
        contraindications: ['MAOI inhibitors', 'asthma'],
        sideEffects: ['Drowsiness', 'Dizziness'],
        category: 'Cold & Flu',
        summary: 'Cough suppressant for dry coughs that keep you awake.',
        details: { form: 'Liquid', classes: ['Suppressant'], strengths: ['30mg'] }
    },

    // --- DIGESTIVE ---
    {
        id: 'tums_expl',
        name: 'Calcium Carbonate (Tums)',
        dosage: '2-4 tablets',
        frequency: 'As needed',
        indication: 'Immediate heartburn relief',
        suitableFor: ['adults', 'pregnant'],
        contraindications: ['kidney stones'],
        sideEffects: ['Constipation', 'Gas'],
        category: 'Digestive',
        summary: 'Safe, instant relief for acid reflux. Safe for pregnancy.',
        details: { form: 'Chewable', classes: ['Antacid'], strengths: ['500mg'] }
    },
    {
        id: 'pepto_expl',
        name: 'Bismuth Subsalicylate (Pepto)',
        dosage: '30ml',
        frequency: 'Every 30-60 mins',
        indication: 'Nausea, diarrhea, upset stomach',
        suitableFor: ['adults'],
        contraindications: ['pregnancy', 'children (Reye\'s syndrome)', 'aspirin allergy'],
        sideEffects: ['Black tongue/stool (harmless)', 'Constipation'],
        category: 'Digestive',
        summary: 'The "pink stuff" for 5-symptom stomache relief.',
        details: { form: 'Liquid', classes: ['Antidiarrheal'], strengths: ['Regular'] }
    },
    {
        id: 'prilosec_expl',
        name: 'Omeprazole (Prilosec)',
        dosage: '20mg',
        frequency: 'Once daily (morning)',
        indication: 'Frequent heartburn (GERD)',
        suitableFor: ['adults'],
        contraindications: ['liver disease'],
        sideEffects: ['Headache', 'Stomach pain'],
        category: 'Digestive',
        summary: 'PPI for preventing heartburn. Takes 1-4 days to work fully.',
        details: { form: 'Capsule', classes: ['PPI'], strengths: ['20mg'] }
    },
    {
        id: 'imodium_expl',
        name: 'Loperamide (Imodium)',
        dosage: '4mg initially',
        frequency: 'After each loose stool',
        indication: 'Acute diarrhea',
        suitableFor: ['adults'],
        contraindications: ['blood in stool', 'bacterial infection'],
        sideEffects: ['Constipation', 'Drowsiness'],
        category: 'Digestive',
        summary: 'Slows digestion to stop diarrhea quickly.',
        details: { form: 'Capsule', classes: ['Antidiarrheal'], strengths: ['2mg'] }
    },

    // --- FIRST AID & TOPICAL ---
    {
        id: 'neosporin_expl',
        name: 'Triple Antibiotic (Neosporin)',
        dosage: 'Apply thin layer',
        frequency: '1-3 times daily',
        indication: 'Minor cuts, scrapes, burns',
        suitableFor: ['adults', 'children'],
        contraindications: ['deep puncture wounds'],
        sideEffects: ['Itching', 'Redness'],
        category: 'First Aid',
        summary: 'Prevents infection in minor wounds.',
        details: { form: 'Ointment', classes: ['Antibiotic'], strengths: ['Standard'] }
    },
    {
        id: 'cortizone_expl',
        name: 'Hydrocortisone 1%',
        dosage: 'Apply sparingly',
        frequency: '3-4 times daily',
        indication: 'Itch, rash, eczema, bites',
        suitableFor: ['adults', 'children > 2'],
        contraindications: ['infection', 'open wounds'],
        sideEffects: ['Thinning skin (long term)', 'Stinging'],
        category: 'First Aid',
        summary: 'Stops itching and redness from rashes or bug bites.',
        details: { form: 'Cream', classes: ['Steroid'], strengths: ['1%'] }
    },

    // --- SLEEP ---
    {
        id: 'melatonin_expl',
        name: 'Melatonin',
        dosage: '3-5mg',
        frequency: '30 mins before bed',
        indication: 'Jet lag, trouble falling asleep',
        suitableFor: ['adults'],
        contraindications: ['autoimmune conditions', 'pregnancy'],
        sideEffects: ['Vivid dreams', 'Morning grogginess'],
        category: 'Sleep',
        summary: 'Natural hormone to reset sleep cycle.',
        details: { form: 'Gummy/Tablet', classes: ['Supplement'], strengths: ['3mg', '5mg'] }
    },
    {
        id: 'unisom_expl',
        name: 'Doxylamine (Unisom)',
        dosage: '25mg',
        frequency: '30 mins before bed',
        indication: 'Short term insomnia',
        suitableFor: ['adults', 'pregnant (check doctor)'],
        contraindications: ['glaucoma', 'asthma'],
        sideEffects: ['Dry mouth', 'Drowsiness'],
        category: 'Sleep',
        summary: 'Stronger sleep aid than melatonin. Safe for pregnancy nausea (with B6).',
        details: { form: 'Tablet', classes: ['Antihistamine'], strengths: ['25mg'] }
    }
];
