import { useState } from 'react';
import { Pill, Search, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TabletRecommendationSectionProps {
  userData: {
    name: string;
    age: string;
    gender: string;
    isPregnant: boolean;
    medicalConditions: string[];
  };
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  indication: string;
  suitableFor: string[];
  contraindications: string[];
  sideEffects: string[];
  category: string;
}

const TabletRecommendationSection = ({ userData }: TabletRecommendationSectionProps) => {
  const [symptom, setSymptom] = useState('');
  const [recommendations, setRecommendations] = useState<Medication[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample medication database
  const medicationDatabase: Medication[] = [
    {
      id: '1',
      name: 'Acetaminophen (Tylenol)',
      dosage: '500-1000mg',
      frequency: 'Every 6-8 hours',
      indication: 'Pain relief, fever reduction',
      suitableFor: ['adults', 'children', 'pregnant'],
      contraindications: ['liver disease'],
      sideEffects: ['Nausea', 'Liver damage (overdose)'],
      category: 'Pain Relief'
    },
    {
      id: '2',
      name: 'Ibuprofen (Advil)',
      dosage: '200-400mg',
      frequency: 'Every 6-8 hours',
      indication: 'Pain relief, inflammation, fever',
      suitableFor: ['adults'],
      contraindications: ['pregnancy', 'heart disease', 'stomach ulcers'],
      sideEffects: ['Stomach upset', 'Dizziness'],
      category: 'Pain Relief'
    },
    {
      id: '3',
      name: 'Loratadine (Claritin)',
      dosage: '10mg',
      frequency: 'Once daily',
      indication: 'Allergies, hay fever',
      suitableFor: ['adults', 'children'],
      contraindications: ['severe liver disease'],
      sideEffects: ['Drowsiness', 'Dry mouth'],
      category: 'Allergies'
    },
    {
      id: '4',
      name: 'Prenatal Vitamins',
      dosage: '1 tablet',
      frequency: 'Once daily',
      indication: 'Pregnancy nutrition support',
      suitableFor: ['pregnant'],
      contraindications: [],
      sideEffects: ['Nausea', 'Constipation'],
      category: 'Vitamins'
    }
  ];

  const getMedicationRecommendations = (searchSymptom: string) => {
    const lowerSymptom = searchSymptom.toLowerCase();
    let filtered = medicationDatabase;

    // Filter based on symptom
    if (lowerSymptom.includes('pain') || lowerSymptom.includes('headache')) {
      filtered = filtered.filter(med => med.indication.toLowerCase().includes('pain'));
    } else if (lowerSymptom.includes('fever')) {
      filtered = filtered.filter(med => med.indication.toLowerCase().includes('fever'));
    } else if (lowerSymptom.includes('allergy') || lowerSymptom.includes('sneez')) {
      filtered = filtered.filter(med => med.indication.toLowerCase().includes('allerg'));
    } else if (lowerSymptom.includes('pregnant') || lowerSymptom.includes('nutrition')) {
      filtered = filtered.filter(med => med.indication.toLowerCase().includes('pregnancy'));
    }

    // Filter based on user profile
    filtered = filtered.filter(med => {
      // Check if suitable for user
      const userProfile = userData.isPregnant ? 'pregnant' : 'adults';
      if (!med.suitableFor.includes(userProfile) && !med.suitableFor.includes('adults')) {
        return false;
      }

      // Check contraindications against medical conditions
      const hasContraindication = med.contraindications.some(contra => 
        userData.medicalConditions.some(condition => 
          condition.toLowerCase().includes(contra.toLowerCase())
        )
      );

      if (userData.isPregnant && med.contraindications.includes('pregnancy')) {
        return false;
      }

      return !hasContraindication;
    });

    return filtered;
  };

  const handleSearch = () => {
    if (!symptom.trim()) return;
    
    setIsSearching(true);
    setTimeout(() => {
      const results = getMedicationRecommendations(symptom);
      setRecommendations(results);
      setIsSearching(false);
    }, 1500);
  };

  const isPregnancySafe = (medication: Medication) => {
    return userData.isPregnant && medication.suitableFor.includes('pregnant');
  };

  const hasContraindication = (medication: Medication) => {
    return medication.contraindications.some(contra => 
      userData.medicalConditions.some(condition => 
        condition.toLowerCase().includes(contra.toLowerCase())
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicine Recommendations
          </CardTitle>
          <CardDescription className="text-white/80">
            Get personalized medication suggestions based on your profile
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* User Profile Summary */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Recommendations for: {userData.name} ({userData.age} years old, {userData.gender})
              {userData.isPregnant && <span className="text-secondary font-medium"> - Currently Pregnant</span>}
              {userData.medicalConditions.length > 0 && (
                <span> - Medical conditions: {userData.medicalConditions.join(', ')}</span>
              )}
            </AlertDescription>
          </Alert>

          {/* Search */}
          <div className="flex gap-2 mb-6">
            <Input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Describe your symptoms (e.g., headache, fever, allergies)..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              variant="medical"
              disabled={!symptom.trim() || isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Important Warning */}
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Important:</strong> These are general recommendations only. Always consult with a healthcare professional before taking any medication, especially during pregnancy or with existing medical conditions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Results */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recommended Medications</h3>
          
          {recommendations.map((medication) => (
            <Card key={medication.id} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-primary">{medication.name}</h4>
                    <p className="text-muted-foreground">{medication.indication}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{medication.category}</Badge>
                    {isPregnancySafe(medication) && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pregnancy Safe
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium mb-2">Dosage & Frequency</h5>
                    <p className="text-sm text-muted-foreground">
                      <strong>Dosage:</strong> {medication.dosage}<br />
                      <strong>Frequency:</strong> {medication.frequency}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Common Side Effects</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {medication.sideEffects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {medication.contraindications.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Contraindications:</strong> {medication.contraindications.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end mt-4">
                  <Button variant="outline-medical">
                    More Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendations.length === 0 && symptom && !isSearching && (
        <Card className="shadow-card">
          <CardContent className="p-6 text-center">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Suitable Medications Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find suitable over-the-counter medications for your symptoms and profile. 
              This might be due to your medical conditions or pregnancy status.
            </p>
            <Button variant="medical">
              Consult with a Doctor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TabletRecommendationSection;