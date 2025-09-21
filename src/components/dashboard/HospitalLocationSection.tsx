import { useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Ambulance, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HospitalLocationSectionProps {
  userData: {
    name: string;
    age: string;
    gender: string;
    isPregnant: boolean;
    medicalConditions: string[];
  };
}

interface Hospital {
  id: string;
  name: string;
  type: 'General Hospital' | 'Specialty Clinic' | 'Emergency Care' | 'Urgent Care';
  distance: number;
  rating: number;
  address: string;
  phone: string;
  specialties: string[];
  emergencyServices: boolean;
  operatingHours: string;
  estimatedWaitTime: string;
  acceptsInsurance: boolean;
}

const HospitalLocationSection = ({ userData }: HospitalLocationSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Sample hospitals database
  const hospitalsDatabase: Hospital[] = [
    {
      id: '1',
      name: 'City General Hospital',
      type: 'General Hospital',
      distance: 2.3,
      rating: 4.2,
      address: '123 Main Street (2.3 miles away)',
      phone: '(555) 123-4567',
      specialties: ['Emergency', 'Cardiology', 'Surgery', 'Obstetrics'],
      emergencyServices: true,
      operatingHours: '24/7',
      estimatedWaitTime: '45 minutes',
      acceptsInsurance: true
    },
    {
      id: '2',
      name: 'Women\'s Health Center',
      type: 'Specialty Clinic',
      distance: 1.8,
      rating: 4.7,
      address: '456 Oak Avenue (1.8 miles away)',
      phone: '(555) 234-5678',
      specialties: ['Obstetrics', 'Gynecology', 'Maternal Care'],
      emergencyServices: false,
      operatingHours: '8 AM - 6 PM',
      estimatedWaitTime: '20 minutes',
      acceptsInsurance: true
    },
    {
      id: '3',
      name: 'QuickCare Urgent Care',
      type: 'Urgent Care',
      distance: 0.9,
      rating: 4.0,
      address: '789 Elm Street (0.9 miles away)',
      phone: '(555) 345-6789',
      specialties: ['Urgent Care', 'Minor Injuries', 'Flu Treatment'],
      emergencyServices: false,
      operatingHours: '7 AM - 10 PM',
      estimatedWaitTime: '15 minutes',
      acceptsInsurance: true
    },
    {
      id: '4',
      name: 'Heart & Vascular Institute',
      type: 'Specialty Clinic',
      distance: 3.1,
      rating: 4.8,
      address: '321 Pine Road (3.1 miles away)',
      phone: '(555) 456-7890',
      specialties: ['Cardiology', 'Vascular Surgery', 'Heart Surgery'],
      emergencyServices: true,
      operatingHours: '6 AM - 8 PM',
      estimatedWaitTime: '30 minutes',
      acceptsInsurance: true
    },
    {
      id: '5',
      name: 'Metro Emergency Hospital',
      type: 'Emergency Care',
      distance: 4.2,
      rating: 3.9,
      address: '654 Cedar Boulevard (4.2 miles away)',
      phone: '(555) 567-8901',
      specialties: ['Emergency', 'Trauma', 'Critical Care'],
      emergencyServices: true,
      operatingHours: '24/7',
      estimatedWaitTime: '60 minutes',
      acceptsInsurance: true
    }
  ];

  const getRecommendedHospitals = () => {
    let filtered = [...hospitalsDatabase];

    // Filter by emergency services if needed
    if (emergencyOnly) {
      filtered = filtered.filter(hospital => hospital.emergencyServices);
    }

    // Filter by condition/specialty
    if (selectedCondition && selectedCondition !== 'all') {
      filtered = filtered.filter(hospital => 
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedCondition.toLowerCase())
        )
      );
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    // Add recommendations based on user profile
    if (userData.isPregnant) {
      const pregnancyHospitals = filtered.filter(h => 
        h.specialties.includes('Obstetrics') || h.specialties.includes('Maternal Care')
      );
      const others = filtered.filter(h => 
        !h.specialties.includes('Obstetrics') && !h.specialties.includes('Maternal Care')
      );
      filtered = [...pregnancyHospitals, ...others];
    }

    if (userData.medicalConditions.includes('Heart Disease') || userData.medicalConditions.includes('Hypertension')) {
      const cardiacHospitals = filtered.filter(h => h.specialties.includes('Cardiology'));
      const others = filtered.filter(h => !h.specialties.includes('Cardiology'));
      filtered = [...cardiacHospitals, ...others];
    }

    return filtered;
  };

  const searchHospitals = () => {
    setIsSearching(true);
    setTimeout(() => {
      const results = getRecommendedHospitals();
      setHospitals(results);
      setIsSearching(false);
    }, 1500);
  };

  const getDirections = (hospital: Hospital) => {
    // In a real app, this would open Google Maps or similar
    const query = encodeURIComponent(hospital.address);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const requestCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          searchHospitals();
        },
        (error) => {
          console.error('Error getting location:', error);
          searchHospitals(); // Search with default location
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      searchHospitals();
    }
  };

  // Auto-search on component mount
  useState(() => {
    requestCurrentLocation();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Hospital & Clinic Locator
          </CardTitle>
          <CardDescription className="text-white/80">
            Find nearby medical facilities and emergency services
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Search by condition/specialty</label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Cardiology">Heart/Cardiac</SelectItem>
                  <SelectItem value="Obstetrics">Pregnancy/Maternity</SelectItem>
                  <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter address or use current location"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={requestCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={searchHospitals}
              variant="medical"
              disabled={isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search Facilities'}
            </Button>
            
            <Button
              onClick={() => {
                setEmergencyOnly(!emergencyOnly);
                searchHospitals();
              }}
              variant={emergencyOnly ? "destructive" : "outline"}
            >
              <Ambulance className="h-4 w-4 mr-2" />
              {emergencyOnly ? 'Show All' : 'Emergency Only'}
            </Button>
          </div>

          {/* Recommendations Alert */}
          {(userData.isPregnant || userData.medicalConditions.length > 0) && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommendations for you:</strong>
                {userData.isPregnant && ' Maternity/Obstetrics facilities are prioritized.'}
                {userData.medicalConditions.includes('Heart Disease') && ' Cardiac care facilities are prioritized.'}
                {userData.medicalConditions.includes('Diabetes') && ' Endocrinology services are recommended.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Emergency Alert */}
      <Alert className="border-red-500 bg-red-50">
        <Ambulance className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Emergency?</strong> For life-threatening emergencies, call 911 immediately. 
          Use the emergency facilities marked below for urgent medical situations.
        </AlertDescription>
      </Alert>

      {/* Hospitals List */}
      {hospitals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Nearby Medical Facilities</h3>
          
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Hospital Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-primary flex items-center gap-2">
                          {hospital.name}
                          {hospital.emergencyServices && (
                            <Badge variant="destructive">
                              <Ambulance className="h-3 w-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                        </h4>
                        <p className="text-muted-foreground">{hospital.type}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{hospital.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-primary">{hospital.distance} miles</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Address</p>
                        <p className="text-sm text-muted-foreground">{hospital.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Hours</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {hospital.operatingHours}
                        </p>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map(specialty => (
                          <Badge key={specialty} variant="outline">{specialty}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Wait Time */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm">
                        <span className="font-medium">Estimated wait time:</span> {hospital.estimatedWaitTime}
                      </p>
                      {hospital.acceptsInsurance && (
                        <p className="text-sm text-green-600 font-medium">✓ Accepts most insurance plans</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="lg:w-48 space-y-3">
                    <Button
                      onClick={() => getDirections(hospital)}
                      variant="medical"
                      className="w-full"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    
                    <Button
                      onClick={() => callHospital(hospital.phone)}
                      variant="outline"
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call {hospital.phone}
                    </Button>

                    {hospital.emergencyServices && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => callHospital(hospital.phone)}
                      >
                        <Ambulance className="h-4 w-4 mr-2" />
                        Emergency
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hospitals.length === 0 && !isSearching && (
        <Card className="shadow-card">
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Facilities Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or allow location access for better results.
            </p>
            <Button variant="medical" onClick={requestCurrentLocation}>
              <Navigation className="h-4 w-4 mr-2" />
              Enable Location Services
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HospitalLocationSection;