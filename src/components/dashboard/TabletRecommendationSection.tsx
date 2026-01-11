import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type React from 'react';
import {
  Pill,
  Search,
  AlertTriangle,
  Info,
  CheckCircle,
  Activity,
  ShieldCheck,
  AlertOctagon,
  Thermometer,
  Baby,
  User,
  Stethoscope,
  ChevronRight,
  FileText,
  Ban,
  Sun,
  Moon,
  Clock,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Check,
  X,

  Sparkles,
  Droplets,
  Coffee,
  Flame,
  Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import {
  Medication,
  MedicationDetails,
  LifestyleAdvice,
  EXTENDED_MEDICATION_DATABASE,
  LIFESTYLE_PROTOCOLS
} from '@/data/MedicalDatabase';

// --- Types & Interfaces ---

interface TabletRecommendationSectionProps {
  userData?: {
    name: string;
    age: string;
    gender: string;
    isPregnant: boolean;
    medicalConditions: string[];
  };
  medications?: Medication[];
}

type RxTermsExtras = {
  STRENGTHS?: (string | null)[];
  ROUTES?: (string | null)[];
  CLASSES?: (string | null)[];
};

type RxTermsResponse = [number, string[]?, RxTermsExtras?, string[][]?];

type SymptomPattern = {
  matchers: string[];
  searchTokens: string[];
  categories: string[];
  label: string;
};

type SymptomIntent = {
  label?: string;
  tokens: string[];
  categories: string[];
  searchTerm: string;
  isPrescriptionRequest?: boolean;
  originalTerm?: string;
};

// --- Constants ---

const RX_TERMS_ENDPOINT = 'https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search';
const DEFAULT_QUERY = 'pain relief';
const GENERIC_SIDE_EFFECTS = [
  'Nausea or stomach discomfort',
  'Dizziness or lightheadedness',
  'Allergic reactions (seek urgent care if severe)'
];

const PRESCRIPTION_KEYWORDS = [
  'antibiotic', 'prescription', 'rx', 'amoxicillin', 'penicillin',
  'steroid', 'infection', 'bacterial', 'z-pack', 'azithromycin',
  'cipro', 'doxycycline', 'medrol', 'prednisone'
];

const SYMPTOM_PATTERNS: SymptomPattern[] = [
  {
    matchers: ['eye', 'vision', 'optic', 'itchy eye', 'blurry', 'pink eye', 'conjunctivitis'],
    searchTokens: ['eye drops', 'ophthalmic', 'artificial tears'],
    categories: ['ophthalmic', 'allerg'],
    label: 'Eye or vision discomfort'
  },
  {
    matchers: ['nose', 'nasal', 'sinus', 'sneeze', 'cold', 'flu', 'runny', 'stuffy'],
    searchTokens: ['nasal congestion', 'sinus relief', 'cold flu', 'decongestant'],
    categories: ['respiratory', 'allerg'],
    label: 'Nasal or sinus congestion'
  },
  {
    matchers: ['throat', 'cough', 'chest', 'phlegm', 'sore throat', 'strep'],
    searchTokens: ['cough suppressant', 'throat lozenge', 'expectorant'],
    categories: ['respiratory'],
    label: 'Throat or cough issues'
  },
  {
    matchers: ['stomach', 'abdomen', 'digest', 'nausea', 'vomit', 'diarrhea', 'constipation', 'bloat'],
    searchTokens: ['digestive relief', 'anti nausea', 'antacid', 'laxative'],
    categories: ['digestive'],
    label: 'Stomach or digestive discomfort'
  },
  {
    matchers: ['burn', 'acid', 'reflux', 'indigestion', 'heartburn', 'gerd'],
    searchTokens: ['antacid', 'acid reducer', 'famotidine', 'calcium carbonate'],
    categories: ['digestive'],
    label: 'Heartburn or indigestion'
  },
  {
    matchers: ['skin', 'rash', 'itch', 'allergy', 'hives', 'bite', 'eczema'],
    searchTokens: ['topical cream', 'hydrocortisone', 'antihistamine'],
    categories: ['allergies', 'topical'],
    label: 'Skin or allergy irritation'
  },
  {
    matchers: ['head', 'headache', 'migraine', 'tension'],
    searchTokens: ['headache relief', 'pain relief', 'acetaminophen', 'ibuprofen'],
    categories: ['pain'],
    label: 'Headache or migraine'
  },
  {
    matchers: ['sleep', 'insomnia', 'awake', 'restless', 'tired'],
    searchTokens: ['sleep aid', 'melatonin', 'nighttime'],
    categories: ['sleep'],
    label: 'Sleep support'
  },
  {
    matchers: ['muscle', 'back', 'joint', 'sprain', 'ache', 'arthritis', 'knee', 'shoulder'],
    searchTokens: ['muscle rub', 'pain relief patch', 'ibuprofen', 'naproxen'],
    categories: ['pain', 'topical'],
    label: 'Muscle or joint pain'
  },
  {
    matchers: ['fever', 'hot', 'temperature', 'chills'],
    searchTokens: ['fever reducer', 'acetaminophen', 'ibuprofen'],
    categories: ['pain', 'fever'],
    label: 'Fever reduction'
  }
];

const defaultUserData = {
  name: 'Guest',
  age: '30',
  gender: 'Not specified',
  isPregnant: false,
  medicalConditions: [] as string[],
};

const defaultMedicationDatabase: Medication[] = EXTENDED_MEDICATION_DATABASE;

// --- Helper Functions ---

const deriveSymptomIntent = (input: string): SymptomIntent => {
  const normalized = input.toLowerCase();
  const trimmed = input.trim();

  // Check for prescription keywords
  const isPrescriptionRequest = PRESCRIPTION_KEYWORDS.some(keyword => normalized.includes(keyword));

  const matched = SYMPTOM_PATTERNS.filter(pattern =>
    pattern.matchers.some(keyword => normalized.includes(keyword))
  );

  if (matched.length === 0) {
    const fallbackTerm = trimmed || DEFAULT_QUERY;
    return {
      tokens: [fallbackTerm],
      categories: [],
      searchTerm: fallbackTerm,
      isPrescriptionRequest,
      originalTerm: trimmed
    };
  }

  const extraTokens = new Set<string>();
  const categories = new Set<string>();
  matched.forEach(pattern => {
    pattern.searchTokens.forEach(token => extraTokens.add(token));
    pattern.categories.forEach(cat => categories.add(cat));
  });

  // If it's a prescription request, we want to search for the *symptom relief* tokens, not the prescription drug name
  // e.g. "antibiotics for throat" -> search for "throat lozenge"
  const combinedTokens = [matched[0].searchTokens[0], ...Array.from(extraTokens)].filter(Boolean);

  return {
    label: matched.map(item => item.label).join(', '),
    tokens: combinedTokens,
    categories: Array.from(categories),
    searchTerm: combinedTokens.join(' '),
    isPrescriptionRequest,
    originalTerm: trimmed
  };
};

const parseMedicationLabel = (label: string) => {
  const match = label.match(/^(.*?)(?:\s+\((.*)\))?$/);
  return {
    name: match?.[1]?.trim() ?? label,
    form: match?.[2]?.replace(/\)$/, '') ?? 'General Care'
  };
};

const transformRxTermsToMedications = (payload: RxTermsResponse, query: string): Medication[] => {
  const [, names = [], extras] = payload;
  const strengths = extras?.STRENGTHS ?? [];
  const routes = extras?.ROUTES ?? [];
  const classes = extras?.CLASSES ?? [];

  return names.map((label, index) => {
    const { name, form } = parseMedicationLabel(label);
    const category = (classes[index] ?? form ?? 'General Care').replace(/\.$/, '');
    const normalizedStrengths = Array.isArray(strengths[index])
      ? (strengths[index] as string[]).filter(Boolean)
      : strengths[index]
        ? [strengths[index] as string]
        : [];
    const normalizedRoutes = Array.isArray(routes[index])
      ? (routes[index] as string[]).filter(Boolean)
      : routes[index]
        ? [routes[index] as string]
        : [];
    const normalizedClasses = Array.isArray(classes[index])
      ? (classes[index] as string[]).filter(Boolean)
      : classes[index]
        ? [classes[index] as string]
        : [];

    const primaryStrength = normalizedStrengths[0] ?? 'Use as directed on the package';
    const primaryRoute = normalizedRoutes[0];

    return {
      id: `${name}-${index}`,
      name,
      dosage: primaryStrength,
      frequency: primaryRoute ? `Route: ${primaryRoute}` : 'Follow on-label frequency',
      indication: query ? `Commonly used for ${query}` : 'General symptom relief',
      suitableFor: [],
      contraindications: [],
      sideEffects: [...GENERIC_SIDE_EFFECTS],
      category,
      summary: form ? `${form} formulation` : undefined,
      details: {
        strengths: normalizedStrengths,
        routes: normalizedRoutes,
        classes: normalizedClasses,
        form
      },
      source: 'api'
    };
  });
};

// --- Sub-Components ---

const ProfileSummary = ({ userData }: { userData: typeof defaultUserData }) => {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 shadow-sm">
      <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
        <User className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-slate-900">{userData.name}</h4>
          <Badge variant="outline" className="text-slate-500 bg-white">{userData.age} years</Badge>
          <Badge variant="outline" className="text-slate-500 bg-white">{userData.gender}</Badge>
          {userData.isPregnant && (
            <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200 gap-1">
              <Baby className="h-3 w-3" /> Pregnant
            </Badge>
          )}
        </div>
        {userData.medicalConditions.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Activity className="h-4 w-4 text-slate-400" />
            <span>Conditions:</span>
            <div className="flex gap-1 flex-wrap">
              {userData.medicalConditions.map((condition, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MedicationCard = ({
  medication,
  isPregnancySafe,
  onMoreInfo
}: {
  medication: Medication;
  isPregnancySafe: boolean;
  onMoreInfo: (med: Medication) => void;
}) => {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-slate-200 bg-white h-full flex flex-col">
      {/* Decorative gradient header */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex justify-between items-start gap-4 mb-2">
          <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border-blue-100 px-2.5 py-0.5 rounded-md">
            {medication.category}
          </Badge>
          {isPregnancySafe && (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium border border-green-100" title="Safe for Pregnancy">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Safe</span>
            </div>
          )}
        </div>

        <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {medication.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-1.5 text-slate-500 text-sm leading-relaxed min-h-[40px]">
          {medication.indication.replace('Commonly used for', 'Used for')}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4 px-6 flex-grow">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-medium uppercase tracking-wide">
              <Pill className="h-3 w-3" /> Dosage
            </div>
            <div className="font-semibold text-slate-900 text-sm truncate" title={medication.dosage}>
              {medication.dosage}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-medium uppercase tracking-wide">
              <Clock className="h-3 w-3" /> Freq
            </div>
            <div className="font-semibold text-slate-900 text-sm truncate" title={medication.frequency}>
              {medication.frequency.split(' ')[0]} {medication.frequency.split(' ')[1]}...
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-600 shadow-sm">
            <FileText className="h-3 w-3 text-slate-400" />
            {medication.details?.form || 'Tablet'}
          </div>
          {medication.details?.routes?.[0] && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-600 shadow-sm">
              <Activity className="h-3 w-3 text-slate-400" />
              {medication.details.routes[0]}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-6 pb-6 mt-auto">
        <Button
          className="w-full justify-between bg-slate-900 text-white hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md group/btn"
          onClick={() => onMoreInfo(medication)}
        >
          <span className="font-medium">View Full Guide</span>
          <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// --- Main Component ---

const TabletRecommendationSection = ({ userData = defaultUserData, medications }: TabletRecommendationSectionProps) => {
  const fallbackMedicationDatabase = useMemo(() => medications ?? defaultMedicationDatabase, [medications]);
  const [symptom, setSymptom] = useState('');
  const [rawRecommendations, setRawRecommendations] = useState<Medication[]>(fallbackMedicationDatabase);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastQueriedTerm, setLastQueriedTerm] = useState(DEFAULT_QUERY);
  const [activeIntent, setActiveIntent] = useState<SymptomIntent | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const skipAutoFetchRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const handleMoreInfo = useCallback((medication: Medication) => {
    setSelectedMedication(medication);
    setIsInfoOpen(true);
  }, []);

  const handleInfoDialogChange = useCallback((open: boolean) => {
    setIsInfoOpen(open);
    if (!open) {
      setSelectedMedication(null);
    }
  }, []);

  const applyProfileFilter = useCallback((medList: Medication[]) => {
    const normalizedConditions = userData.medicalConditions.map(condition => condition.toLowerCase());
    const userProfile = userData.isPregnant ? 'pregnant' : 'adults';

    return medList.filter(med => {
      const suitability = med.suitableFor ?? [];
      if (suitability.length > 0) {
        const normalizedSuitability = suitability.map(entry => entry.toLowerCase());
        if (
          !normalizedSuitability.includes('all') &&
          !normalizedSuitability.includes(userProfile)
        ) {
          if (!(userProfile === 'pregnant' && normalizedSuitability.includes('pregnant'))) {
            return false;
          }
        }
      }

      if (userData.isPregnant && med.contraindications?.some(contra => contra.toLowerCase().includes('pregnan'))) {
        return false;
      }

      if (med.contraindications?.length) {
        const hasContraindication = med.contraindications.some(contra =>
          normalizedConditions.some(condition => condition.includes(contra.toLowerCase()))
        );
        if (hasContraindication) {
          return false;
        }
      }

      return true;
    });
  }, [userData]);

  const getMedicationRecommendations = useCallback((searchSymptom: string, dataset: Medication[] = fallbackMedicationDatabase, intent?: SymptomIntent | null) => {
    const lowerSymptom = searchSymptom.toLowerCase().trim();
    if (!lowerSymptom) return applyProfileFilter(dataset);

    // Scoring System:
    // 50 pts: Exact name match
    // 30 pts: Indication match (strong)
    // 20 pts: Summary match
    // 10 pts: Category match
    const scoredMeds = dataset.map(med => {
      let score = 0;
      const lowerName = med.name.toLowerCase();
      const lowerIndication = med.indication.toLowerCase();
      const lowerSummary = med.summary?.toLowerCase() || '';
      const lowerCategory = med.category.toLowerCase();

      if (lowerName.includes(lowerSymptom)) score += 50;
      if (lowerIndication.includes(lowerSymptom)) score += 30;
      if (lowerSummary.includes(lowerSymptom)) score += 20;

      // Category matching from intent or direct search
      if (intent?.categories?.length) {
        if (intent.categories.some(cat => lowerCategory.includes(cat))) score += 15;
      }
      if (lowerCategory.includes(lowerSymptom)) score += 10;

      return { ...med, matchScore: score };
    });

    // Filter relevant meds (score > 0) AND apply safety profile
    let filtered = scoredMeds
      .filter(med => med.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    // If direct search fails, try broad category matching from intents
    if (filtered.length === 0 && intent?.categories?.length) {
      const categoryMatches = dataset.filter(med =>
        intent.categories.some(cat => med.category.toLowerCase().includes(cat))
      );
      filtered = categoryMatches.map(med => ({ ...med, matchScore: 10 }));
    }

    return applyProfileFilter(filtered);
  }, [applyProfileFilter, fallbackMedicationDatabase]);

  const filteredRecommendations = useMemo(() => {
    let filtered = applyProfileFilter(rawRecommendations);

    if (activeIntent?.categories?.length) {
      const loweredCategories = activeIntent.categories.map(cat => cat.toLowerCase());
      filtered = filtered.filter(med =>
        med.category
          ? loweredCategories.some(category => med.category.toLowerCase().includes(category))
          : true
      );
    }

    return filtered;
  }, [activeIntent, applyProfileFilter, rawRecommendations]);

  const requestRecommendations = useCallback(async (term: string) => {
    const intent = deriveSymptomIntent(term);
    const query = intent.searchTerm || DEFAULT_QUERY;
    const displayTerm = term.trim() || intent.label || DEFAULT_QUERY;
    setActiveIntent(intent);
    const requestId = ++requestIdRef.current;
    setIsSearching(true);
    setFetchError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `${RX_TERMS_ENDPOINT}?terms=${encodeURIComponent(query)}&ef=STRENGTHS,ROUTES,CLASSES`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch medication recommendations');
      }

      const payload: RxTermsResponse = await response.json();
      const parsed = transformRxTermsToMedications(payload, query);

      if (parsed.length === 0) {
        setRawRecommendations(getMedicationRecommendations(query, fallbackMedicationDatabase, intent));
      } else {
        setRawRecommendations(parsed.map(med => ({
          ...med,
          category: med.category || intent.categories[0] || 'General Care'
        })));
      }
      setLastQueriedTerm(displayTerm);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      console.error('TabletRecommendationSection: unable to fetch medications', error);
      setFetchError('Unable to fetch live medication data. Showing offline suggestions instead.');
      setRawRecommendations(getMedicationRecommendations(query, fallbackMedicationDatabase, intent));
      setLastQueriedTerm(displayTerm);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  }, [fallbackMedicationDatabase, getMedicationRecommendations]);

  const handleSearch = useCallback((term?: string) => {
    const query = (term ?? symptom).trim();
    if (!query) return;
    skipAutoFetchRef.current = true;
    requestRecommendations(query);
  }, [requestRecommendations, symptom]);

  useEffect(() => {
    requestRecommendations(DEFAULT_QUERY);
  }, [requestRecommendations]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const trimmed = symptom.trim();
    if (!trimmed) {
      if (lastQueriedTerm !== DEFAULT_QUERY) {
        requestRecommendations(DEFAULT_QUERY);
      }
      return;
    }

    if (skipAutoFetchRef.current) {
      skipAutoFetchRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      requestRecommendations(trimmed);
    }, 400);

    return () => clearTimeout(timer);
  }, [lastQueriedTerm, requestRecommendations, symptom]);

  const isPregnancySafe = (medication: Medication) => {
    return userData.isPregnant && medication.suitableFor?.includes('pregnant');
  };

  const getSafetyStatus = (medication: Medication) => {
    const warnings: string[] = [];
    let status: 'safe' | 'caution' | 'warning' = 'safe';

    if (userData.isPregnant) {
      if (medication.contraindications.some(c => c.toLowerCase().includes('pregnan'))) {
        status = 'warning';
        warnings.push('Not recommended during pregnancy');
      } else if (!medication.suitableFor?.includes('pregnant')) {
        status = 'caution';
        warnings.push('Consult doctor before use during pregnancy');
      }
    }

    if (userData.medicalConditions.length > 0) {
      medication.contraindications.forEach(contra => {
        userData.medicalConditions.forEach(cond => {
          if (cond.toLowerCase().includes(contra.toLowerCase()) || contra.toLowerCase().includes(cond.toLowerCase())) {
            status = 'warning';
            warnings.push(`May interact with ${cond}`);
          }
        });
      });
    }

    return { status, warnings };

  };

  const getLifestyleAdvice = useCallback(() => {
    if (!activeIntent?.categories?.length) return LIFESTYLE_PROTOCOLS['general'] || [];

    const relevantAdvice: LifestyleAdvice[] = [];
    const seenIds = new Set<string>();

    Object.values(LIFESTYLE_PROTOCOLS).flat().forEach(advice => {
      // Check if advice.category intersects with activeIntent.categories
      const hasMatch = advice.category.some(c => activeIntent.categories.some(ic => ic.includes(c) || c.includes(ic)));

      if (hasMatch && !seenIds.has(advice.id)) {
        relevantAdvice.push(advice);
        seenIds.add(advice.id);
      }
    });

    // Fallback to general if nothing specific found
    if (relevantAdvice.length === 0) {
      return LIFESTYLE_PROTOCOLS['general'] || [];
    }

    return relevantAdvice.slice(0, 4);
  }, [activeIntent]);

  const lifestyleTips = getLifestyleAdvice();

  const IconMap: Record<string, React.ElementType> = {
    Water: Droplets,
    Moon: Moon,
    Sun: Sun,
    Coffee: Coffee,
    Check: Check,
    Alert: AlertTriangle
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-xl isolate">
        {/* Abstract shapes background - Adjusted for light theme */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl mix-blend-multiply" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

        <div className="relative p-8 md:p-12 z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 backdrop-blur-md text-sm font-medium text-blue-700">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>AI-Powered Pharmacy Guide</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Find the right relief,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  instantly & safely.
                </span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                Personalized over-the-counter recommendations analyzed against your health profile for maximum safety.
              </p>
            </div>

            <div className="w-full lg:w-auto min-w-[360px] bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 shadow-lg ring-1 ring-slate-100">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="pl-12 h-14 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-5 w-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                )}
                {!isSearching && symptom && (
                  <button
                    onClick={() => setSymptom('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-1">
        <ProfileSummary userData={userData} />

        {/* Prescription Warning */}
        {activeIntent?.isPrescriptionRequest && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-900 animate-in slide-in-from-top-2">
            <Ban className="h-5 w-5 text-blue-600" />
            <div className="ml-2">
              <AlertTitle className="text-blue-900 font-semibold mb-1">Prescription Request Detected</AlertTitle>
              <AlertDescription>
                I noticed you mentioned <strong>"{activeIntent.originalTerm}"</strong>.
                As an AI assistant, I cannot prescribe medication (like antibiotics or steroids).
                However, I have found some <strong>over-the-counter options</strong> below that may help relieve your symptoms while you wait to see a doctor.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {activeIntent?.label && !activeIntent.isPrescriptionRequest && (
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg w-fit">
            <Info className="h-4 w-4 text-primary" />
            <span>Showing results for:</span>
            <span className="font-semibold text-primary">{activeIntent.label}</span>
          </div>
        )}

        {fetchError && (
          <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
            <AlertOctagon className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        {/* Results Grid */}
        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                isPregnancySafe={isPregnancySafe(medication)}
                onMoreInfo={handleMoreInfo}
              />
            ))}
          </div>
        ) : (
          !isSearching && (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Matches Found</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                We couldn't find suitable medications for "{lastQueriedTerm}". This might be due to your specific medical profile or pregnancy status.
              </p>
              <Button variant="outline" onClick={() => setSymptom('')}>
                Clear Search
              </Button>
            </div>
          )
        )}


        {/* Holistic Care Section */}
        {lifestyleTips.length > 0 && !fetchError && (
          <div className="mt-12 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Holistic Care & Lifestyle Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {lifestyleTips.map(tip => {
                const Icon = IconMap[tip.icon] || Sparkles;
                return (
                  <Card key={tip.id} className="bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50 transition-colors shadow-sm hover:shadow-md">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                        <div className="p-1.5 bg-white rounded-md shadow-sm text-emerald-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        {tip.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-xs text-emerald-800/80 leading-relaxed font-medium">{tip.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <Alert className="mt-8 border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            <strong>Medical Disclaimer:</strong> These recommendations are for informational purposes only.
            Always consult a healthcare professional before taking any medication, especially if you are pregnant or have existing medical conditions.
          </AlertDescription>
        </Alert>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isInfoOpen} onOpenChange={handleInfoDialogChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-slate-50/50 backdrop-blur-xl">
          {selectedMedication && (
            <>
              <DialogHeader className="p-6 pb-0 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                      {selectedMedication.category}
                    </Badge>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                      {selectedMedication.name}
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      {selectedMedication.indication}
                    </DialogDescription>
                  </div>
                  {getSafetyStatus(selectedMedication).status === 'safe' && (
                    <div className="flex flex-col items-center gap-1 p-2 bg-green-50 rounded-lg border border-green-100">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                      <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Safe Match</span>
                    </div>
                  )}
                  {getSafetyStatus(selectedMedication).status === 'caution' && (
                    <div className="flex flex-col items-center gap-1 p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Caution</span>
                    </div>
                  )}
                  {getSafetyStatus(selectedMedication).status === 'warning' && (
                    <div className="flex flex-col items-center gap-1 p-2 bg-red-50 rounded-lg border border-red-100">
                      <ShieldAlert className="h-6 w-6 text-red-600" />
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Warning</span>
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-auto p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-6 p-1 bg-slate-200/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="pills" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Dosage & Usage</TabsTrigger>
                    <TabsTrigger value="safety" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Safety Check</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-0 focus-visible:ring-0">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" /> Drug Summary
                        </h4>
                        <p className="text-slate-600 leading-relaxed text-sm">
                          {selectedMedication.summary || selectedMedication.indication}
                        </p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Form</span>
                          <p className="font-medium text-slate-900 mt-1">{selectedMedication.details?.form || 'Tablet'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class</span>
                          <p className="font-medium text-slate-900 mt-1">{selectedMedication.details?.classes?.[0] || 'General'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pills" className="mt-0 focus-visible:ring-0">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                          <Clock className="h-10 w-10 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Recommended Schedule</p>
                          <p className="text-lg font-bold text-slate-900">{selectedMedication.frequency}</p>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <div className="grid divide-y divide-slate-100">
                          <div className="p-4 flex items-center gap-4">
                            <Sun className="h-5 w-5 text-amber-500" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">Morning Dose</p>
                              <p className="text-xs text-slate-500">Take with food if stomach upset occurs</p>
                            </div>
                            <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded">
                              {selectedMedication.frequency.includes('4-6') ? '8:00 AM' : '9:00 AM'}
                            </span>
                          </div>
                          <div className="p-4 flex items-center gap-4">
                            <Moon className="h-5 w-5 text-indigo-500" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">Evening Dose</p>
                              <p className="text-xs text-slate-500">Ensure 6-8 hour gap from last dose</p>
                            </div>
                            <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded">
                              {selectedMedication.frequency.includes('4-6') ? '2:00 PM' : '9:00 PM'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex gap-3 items-start border border-blue-100">
                      <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <p>
                        Always follow label instructions. Do not exceed <strong>{selectedMedication.dosage}</strong> per dose unless directed by a physician.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="safety" className="mt-0 focus-visible:ring-0">
                    <div className="space-y-4">
                      {/* Interaction Status */}
                      {(() => {
                        const safety = getSafetyStatus(selectedMedication);
                        if (safety.status !== 'safe') {
                          return (
                            <Alert variant={safety.status === 'warning' ? 'destructive' : 'default'} className={cn(
                              safety.status === 'warning' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                            )}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle className="font-bold">Profile Safety Alert</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc pl-4 mt-2 space-y-1 text-sm">
                                  {safety.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          );
                        }
                        return (
                          <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-800">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-sm font-medium">No direct contraindications found for your profile.</p>
                          </div>
                        );
                      })()}

                      {/* Side Effects List */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 font-medium text-slate-700 text-sm">
                          Possible Side Effects
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-2">
                          {selectedMedication.sideEffects.map((effect, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              {effect}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General Contraindications */}
                      {selectedMedication.contraindications.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                          <div className="p-3 bg-red-50 border-b border-red-100 font-medium text-red-800 text-sm">
                            <Ban className="h-3 w-3 inline mr-2" />
                            Do Not Use If
                          </div>
                          <div className="p-4 flex flex-wrap gap-2">
                            {selectedMedication.contraindications.map((c, i) => (
                              <Badge key={i} variant="outline" className="text-slate-600 border-slate-200">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TabletRecommendationSection;