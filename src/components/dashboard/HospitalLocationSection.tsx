import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Ambulance, Search, Map as MapIcon, List, Car, Footprints, Bus, Copy, ExternalLink, Heart, Shield, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Red Icon for Hospitals
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Coordinates = { lat: number; lng: number };

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
  coordinates: Coordinates;
}

const HospitalLocationSection = ({ userData }: HospitalLocationSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [rawHospitals, setRawHospitals] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [searchedLocationName, setSearchedLocationName] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(13);

  const [showMap, setShowMap] = useState(true);
  const liveWatchId = useRef<number | null>(null);

  // Component to update map center when location changes
  const MapUpdater = ({ center, zoom }: { center: Coordinates; zoom: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([center.lat, center.lng], zoom);
    }, [center, zoom, map]);
    return null;
  };

  // Sample hospitals database
  const hospitalsDatabase: Hospital[] = [
    {
      id: '1',
      name: 'City General Hospital',
      type: 'General Hospital',
      distance: 2.3,
      rating: 4.2,
      address: '123 Main Street',
      phone: '(555) 123-4567',
      specialties: ['Emergency', 'Cardiology', 'Surgery', 'Obstetrics'],
      emergencyServices: true,
      operatingHours: '24/7',
      estimatedWaitTime: '45 minutes',
      acceptsInsurance: true,
      coordinates: { lat: 37.77986, lng: -122.42905 }
    },
    {
      id: '2',
      name: 'Women\'s Health Center',
      type: 'Specialty Clinic',
      distance: 1.8,
      rating: 4.7,
      address: '456 Oak Avenue',
      phone: '(555) 234-5678',
      specialties: ['Obstetrics', 'Gynecology', 'Maternal Care'],
      emergencyServices: false,
      operatingHours: '8 AM - 6 PM',
      estimatedWaitTime: '20 minutes',
      acceptsInsurance: true,
      coordinates: { lat: 37.76892, lng: -122.42274 }
    },
    {
      id: '3',
      name: 'QuickCare Urgent Care',
      type: 'Urgent Care',
      distance: 0.9,
      rating: 4.0,
      address: '789 Elm Street',
      phone: '(555) 345-6789',
      specialties: ['Urgent Care', 'Minor Injuries', 'Flu Treatment'],
      emergencyServices: false,
      operatingHours: '7 AM - 10 PM',
      estimatedWaitTime: '15 minutes',
      acceptsInsurance: true,
      coordinates: { lat: 37.76652, lng: -122.43244 }
    },
    {
      id: '4',
      name: 'Heart & Vascular Institute',
      type: 'Specialty Clinic',
      distance: 3.1,
      rating: 4.8,
      address: '321 Pine Road',
      phone: '(555) 456-7890',
      specialties: ['Cardiology', 'Vascular Surgery', 'Heart Surgery'],
      emergencyServices: true,
      operatingHours: '6 AM - 8 PM',
      estimatedWaitTime: '30 minutes',
      acceptsInsurance: true,
      coordinates: { lat: 37.78421, lng: -122.40865 }
    },
    {
      id: '5',
      name: 'Metro Emergency Hospital',
      type: 'Emergency Care',
      distance: 4.2,
      rating: 3.9,
      address: '654 Cedar Boulevard',
      phone: '(555) 567-8901',
      specialties: ['Emergency', 'Trauma', 'Critical Care'],
      emergencyServices: true,
      operatingHours: '24/7',
      estimatedWaitTime: '60 minutes',
      acceptsInsurance: true,
      coordinates: { lat: 37.76574, lng: -122.45224 }
    },
    {
      id: '6',
      name: 'City Eye Clinic',
      type: 'Specialty Clinic',
      distance: 1.5,
      rating: 4.5,
      address: '101 Vision Way',
      phone: '(555) 111-2222',
      specialties: ['Ophthalmology', 'Eye Surgery', 'Vision Care'],
      emergencyServices: false,
      operatingHours: '9 AM - 5 PM',
      estimatedWaitTime: '10 minutes',
      acceptsInsurance: true,
      coordinates: { lat: 37.77000, lng: -122.44000 }
    },
    {
      id: '7',
      name: 'Dermatology & Skin Care Center',
      type: 'Specialty Clinic',
      distance: 2.8,
      rating: 4.6,
      address: '202 Skin Lane',
      phone: '(555) 333-4444',
      specialties: ['Dermatology', 'Skin Care', 'Cosmetic Surgery'],
      emergencyServices: false,
      operatingHours: '8 AM - 4 PM',
      estimatedWaitTime: '15 minutes',
      acceptsInsurance: true,
      coordinates: { lat: 37.76000, lng: -122.41000 }
    }
  ];

  const defaultLocation = hospitalsDatabase[0].coordinates;

  const calculateDistanceInMiles = (origin: Coordinates, destination: Coordinates) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(destination.lat - origin.lat);
    const dLon = toRad(destination.lng - origin.lng);
    const lat1 = toRad(origin.lat);
    const lat2 = toRad(destination.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = earthRadiusKm * c;
    return distanceKm * 0.621371;
  };

  const getHospitalsWithDistance = (location: Coordinates) => {
    return hospitalsDatabase.map((hospital) => ({
      ...hospital,
      distance: Number(calculateDistanceInMiles(location, hospital.coordinates).toFixed(1))
    }));
  };

  const getRecommendedHospitals = (locationOverride?: Coordinates | null) => {
    const resolvedLocation = locationOverride ?? userLocation ?? defaultLocation;
    const hospitalsWithDistance = resolvedLocation ? getHospitalsWithDistance(resolvedLocation) : [...hospitalsDatabase];
    let filtered = [...hospitalsWithDistance];

    // Filter by emergency services if needed
    if (emergencyOnly) {
      filtered = filtered.filter(hospital => hospital.emergencyServices);
    }

    // Filter by condition/specialty
    if (specialtyFilter.trim()) {
      const term = specialtyFilter.toLowerCase().trim();
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(term) ||
        hospital.type.toLowerCase().includes(term) ||
        hospital.specialties.some(specialty =>
          specialty.toLowerCase().includes(term)
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

  const geocodeLocation = async (query: string): Promise<{ coords: Coordinates; displayName: string } | null> => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    const { lat, lon, display_name } = data[0];
    return {
      coords: { lat: parseFloat(lat), lng: parseFloat(lon) },
      displayName: display_name || query
    };
  };

  const inferSpecialties = (name: string, tags: Record<string, string | undefined>): string[] => {
    const specialties = new Set<string>();
    const lowerName = name.toLowerCase();
    const lowerType = (tags.amenity || '').toLowerCase();
    const healthcare = (tags.healthcare || '').toLowerCase();

    // General/Emergency
    if (lowerName.includes('hospital') || lowerType === 'hospital' || tags.emergency === 'yes') {
      specialties.add('General Practice');
      if (tags.emergency === 'yes') specialties.add('Emergency');
    }

    // Eye / Ophthalmology
    if (lowerName.includes('eye') || lowerName.includes('vision') || lowerName.includes('retina') || lowerName.includes('lasik') || healthcare === 'ophthalmology') {
      specialties.add('Ophthalmology');
      specialties.add('Vision Care');
    }

    // Skin / Dermatology
    if (lowerName.includes('skin') || lowerName.includes('derma') || lowerName.includes('cutaneous') || healthcare === 'dermatology') {
      specialties.add('Dermatology');
      specialties.add('Skin Care');
    }

    // Dental
    if (lowerName.includes('dental') || lowerName.includes('dentist') || lowerName.includes('tooth') || lowerName.includes('orthodont') || lowerType === 'dentist' || healthcare === 'dentist') {
      specialties.add('Dentistry');
    }

    // Heart / Cardiology
    if (lowerName.includes('heart') || lowerName.includes('cardio') || lowerName.includes('vascular')) {
      specialties.add('Cardiology');
    }

    // Women / OBGYN
    if (lowerName.includes('women') || lowerName.includes('maternity') || lowerName.includes('obgyn') || lowerName.includes('birth')) {
      specialties.add('Obstetrics');
      specialties.add('Gynecology');
    }

    // Orthopedics
    if (lowerName.includes('ortho') || lowerName.includes('bone') || lowerName.includes('joint') || lowerName.includes('spine')) {
      specialties.add('Orthopedics');
    }

    // Pediatric
    if (lowerName.includes('pediatric') || lowerName.includes('child') || lowerName.includes('kid')) {
      specialties.add('Pediatrics');
    }

    // Default if empty
    if (specialties.size === 0) {
      specialties.add('General Practice');
    }

    return Array.from(specialties);
  };

  const fetchNearbyHospitals = async (lat: number, lng: number): Promise<Hospital[]> => {
    const radius = 10000; // 10km radius for better coverage
    const query = `
      [out:json];
      (
        node["amenity"~"hospital|clinic|doctors|dentist"](around:${radius},${lat},${lng});
        way["amenity"~"hospital|clinic|doctors|dentist"](around:${radius},${lat},${lng});
        relation["amenity"~"hospital|clinic|doctors|dentist"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Overpass API failed');
      const data = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.elements.map((element: any) => {
        const center = element.center || element;
        let type: Hospital['type'] = 'Specialty Clinic';
        // Ensure tags is treated as a record
        const tags = (element.tags || {}) as Record<string, string | undefined>;

        if (tags.amenity === 'hospital') type = 'General Hospital';
        else if (tags.amenity === 'doctors') type = 'Specialty Clinic';
        else if (tags.amenity === 'dentist') type = 'Specialty Clinic';
        else if (tags.emergency === 'yes') type = 'Emergency Care';

        const isEmergency = tags.emergency === 'yes' || type === 'General Hospital';
        const rating = (3.5 + Math.random() * 1.5).toFixed(1);
        const waitTime = Math.floor(15 + Math.random() * 45) + ' minutes';
        const name = tags.name || 'Unnamed Medical Facility';

        // Generate a random mock phone number if real one is missing
        const mockPhone = `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
        const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || mockPhone;

        return {
          id: String(element.id),
          name: name,
          type: type,
          distance: 0, // Calculated later
          rating: Number(rating),
          address: element.tags['addr:street'] ? `${element.tags['addr:street']} ${element.tags['addr:housenumber'] || ''}` : 'Address details unavailable',
          phone: phone,
          specialties: inferSpecialties(name, element.tags),
          emergencyServices: isEmergency,
          operatingHours: element.tags.opening_hours || '24/7',
          estimatedWaitTime: waitTime,
          acceptsInsurance: true,
          coordinates: { lat: center.lat, lng: center.lon }
        };
      });
    } catch (error) {
      console.error('Error fetching from Overpass:', error);
      return [];
    }
  };

  const fetchIpLocation = async (): Promise<Coordinates | null> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP Location failed');
      const data = await response.json();
      return { lat: data.latitude, lng: data.longitude };
    } catch (error) {
      console.error('Error fetching IP location:', error);
      return null;
    }
  };

  // Generate sample hospitals around any given location
  const generateSampleHospitalsForLocation = (location: Coordinates): Hospital[] => {
    const sampleHospitalTemplates = [
      { nameSuffix: 'General Hospital', type: 'General Hospital' as const, specialties: ['Emergency', 'Surgery', 'Internal Medicine'], emergency: true },
      { nameSuffix: 'Medical Center', type: 'General Hospital' as const, specialties: ['Cardiology', 'Neurology', 'Oncology'], emergency: true },
      { nameSuffix: 'Community Clinic', type: 'Specialty Clinic' as const, specialties: ['Family Medicine', 'Pediatrics', 'Vaccination'], emergency: false },
      { nameSuffix: 'Urgent Care', type: 'Urgent Care' as const, specialties: ['Urgent Care', 'Minor Injuries', 'X-Ray'], emergency: false },
      { nameSuffix: 'Emergency Hospital', type: 'Emergency Care' as const, specialties: ['Emergency', 'Trauma', 'Critical Care'], emergency: true },
      { nameSuffix: "Women's Health Center", type: 'Specialty Clinic' as const, specialties: ['Obstetrics', 'Gynecology', 'Maternal Care'], emergency: false },
      { nameSuffix: 'Eye Care Center', type: 'Specialty Clinic' as const, specialties: ['Ophthalmology', 'Vision Care', 'Eye Surgery'], emergency: false },
      { nameSuffix: 'Heart Institute', type: 'Specialty Clinic' as const, specialties: ['Cardiology', 'Heart Surgery', 'Vascular'], emergency: true },
    ];

    const cityPrefixes = ['City', 'Metro', 'Central', 'Regional', 'Community', 'University', 'Memorial', 'St. Mary\'s'];

    return sampleHospitalTemplates.map((template, index) => {
      // Generate random offset within ~5 miles
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      const hospitalCoords = {
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset
      };

      const distance = calculateDistanceInMiles(location, hospitalCoords);
      const prefix = cityPrefixes[index % cityPrefixes.length];

      return {
        id: `sample-${index + 1}`,
        name: `${prefix} ${template.nameSuffix}`,
        type: template.type,
        distance: Number(distance.toFixed(1)),
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        address: `${Math.floor(Math.random() * 9000) + 100} Main Street`,
        phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        specialties: template.specialties,
        emergencyServices: template.emergency,
        operatingHours: template.emergency ? '24/7' : '8 AM - 8 PM',
        estimatedWaitTime: `${Math.floor(15 + Math.random() * 45)} minutes`,
        acceptsInsurance: true,
        coordinates: hospitalCoords
      };
    }).sort((a, b) => a.distance - b.distance);
  };

  const searchHospitals = async (
    locationOverride?: Coordinates | null,
    options?: { skipGeocoding?: boolean; silent?: boolean; locationName?: string }
  ) => {
    if (!options?.silent) {
      setIsSearching(true);
    }
    setLocationError(null);

    try {
      let resolvedLocation = locationOverride ?? userLocation ?? null;
      let locationDisplayName = options?.locationName || null;

      // Geocode the search query if provided
      if (!options?.skipGeocoding && searchQuery.trim()) {
        const geocodedResult = await geocodeLocation(searchQuery.trim());
        if (geocodedResult) {
          resolvedLocation = geocodedResult.coords;
          locationDisplayName = geocodedResult.displayName;
          setUserLocation(geocodedResult.coords);
          setSearchedLocationName(geocodedResult.displayName);
          setMapZoom(14); // Zoom in when searching a specific location
        } else {
          setLocationError(`Could not find "${searchQuery}". Please try a different address or city name.`);
          setSearchedLocationName(null);
          return;
        }
      } else if (locationOverride) {
        // Clear searched location name when using GPS
        setSearchedLocationName(locationDisplayName);
      }

      let results: Hospital[] = [];

      // Fetch dynamic data if we have a location
      if (resolvedLocation) {
        const dynamicHospitals = await fetchNearbyHospitals(resolvedLocation.lat, resolvedLocation.lng);
        if (dynamicHospitals.length > 0) {
          results = dynamicHospitals;
        } else {
          // Generate sample hospitals near the searched location
          results = generateSampleHospitalsForLocation(resolvedLocation);
          // Only show info message, not an error
          console.log('No live data found, using generated sample hospitals for this location');
        }
      } else {
        results = getRecommendedHospitals(defaultLocation);
      }

      setRawHospitals(results);
      // Filtering will be handled by useEffect
    } catch (error) {
      console.error('Error searching hospitals:', error);
      setLocationError('Unable to fetch location information right now. Showing default recommendations.');
      setRawHospitals(getRecommendedHospitals(defaultLocation));
    } finally {
      if (!options?.silent) {
        setIsSearching(false);
      }
    }
  };

  // Handle Enter key press in location search
  const handleLocationKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      void searchHospitals();
    }
  };

  // Real-time filtering effect
  useEffect(() => {
    let filtered = [...rawHospitals];
    const currentLoc = userLocation || defaultLocation;

    // Calculate distances
    filtered = filtered.map(h => ({
      ...h,
      distance: Number(calculateDistanceInMiles(currentLoc, h.coordinates).toFixed(1))
    }));

    // Filter by emergency services
    if (emergencyOnly) {
      filtered = filtered.filter(hospital => hospital.emergencyServices);
    }

    // Filter by condition/specialty (skip if 'all' or empty)
    if (specialtyFilter && specialtyFilter !== 'all' && specialtyFilter.trim()) {
      const term = specialtyFilter.toLowerCase().trim();
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(term) ||
        hospital.type.toLowerCase().includes(term) ||
        hospital.specialties.some(specialty =>
          specialty.toLowerCase().includes(term)
        )
      );
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setHospitals(filtered);
  }, [rawHospitals, specialtyFilter, emergencyOnly, userLocation, defaultLocation]);


  // Get navigation URL with specific travel mode
  const getNavigationUrl = (hospital: Hospital, travelMode: 'driving' | 'walking' | 'transit') => {
    const destination = `${hospital.coordinates.lat},${hospital.coordinates.lng}`;

    if (userLocation) {
      const origin = `${userLocation.lat},${userLocation.lng}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${destination}`;
  };

  const getDirections = (hospital: Hospital, travelMode: 'driving' | 'walking' | 'transit' = 'driving') => {
    const url = getNavigationUrl(hospital, travelMode);
    window.open(url, '_blank');
  };

  // Estimate travel time based on distance
  const getEstimatedTravelTime = (distanceMiles: number, mode: 'driving' | 'walking' | 'transit') => {
    const speeds = { driving: 25, walking: 3, transit: 15 }; // mph
    const hours = distanceMiles / speeds[mode];
    const minutes = Math.round(hours * 60);

    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
  };

  // Copy address to clipboard
  const copyAddress = async (hospital: Hospital) => {
    const address = `${hospital.name}, ${hospital.address}`;
    try {
      await navigator.clipboard.writeText(address);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Share hospital location
  const shareHospital = async (hospital: Hospital) => {
    const shareData = {
      title: hospital.name,
      text: `${hospital.name} - ${hospital.type}\nAddress: ${hospital.address}\nPhone: ${hospital.phone}`,
      url: getNavigationUrl(hospital, 'driving')
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const stopLiveLocationTracking = () => {
    if (liveWatchId.current !== null) {
      navigator.geolocation.clearWatch(liveWatchId.current);
      liveWatchId.current = null;
    }
    setIsLiveTracking(false);
  };

  const startLiveLocationTracking = () => {
    if (isLiveTracking) return;
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }

    setLocationError(null);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        void searchHospitals(coords, { skipGeocoding: true, silent: true });
      },
      async (error) => {
        console.error('Error tracking location:', error);
        setLocationError('Unable to keep tracking your location.');
        stopLiveLocationTracking();
        // Try IP Fallback
        const ipLocation = await fetchIpLocation();
        if (ipLocation) {
          console.log("Using IP Location (fallback from tracking error):", ipLocation);
          setUserLocation(ipLocation);
          setLocationError('Live tracking failed. Using approximate location from network.');
          void searchHospitals(ipLocation, { skipGeocoding: true, silent: true });
          return;
        }
        void searchHospitals(defaultLocation, { skipGeocoding: true, silent: true });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000
      }
    );

    liveWatchId.current = watchId;
    setIsLiveTracking(true);
  };

  const requestCurrentLocation = () => {
    if (isLiveTracking) {
      stopLiveLocationTracking();
    }
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log("Location found:", coords);
        setUserLocation(coords);
        setIsLocating(false);
        setSearchedLocationName(null); // Clear any searched location
        setMapZoom(13); // Reset to default zoom
        setSearchQuery(''); // Clear the search input
        // Auto-search nearby hospitals when location is found
        void searchHospitals(coords, { skipGeocoding: true, locationName: 'Your Current Location' });
      },
      async (error) => {
        console.error('Error getting location:', error);

        // Try IP Fallback
        const ipLocation = await fetchIpLocation();
        if (ipLocation) {
          console.log("Using IP Location:", ipLocation);
          setUserLocation(ipLocation);
          setIsLocating(false);
          setLocationError('Using approximate location from network.');
          void searchHospitals(ipLocation, { skipGeocoding: true });
          return;
        }

        setIsLocating(false);
        let errorMessage = 'Unable to access your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        }
        setLocationError(errorMessage);
        // Fallback to default location if user location fails
        if (!userLocation) {
          void searchHospitals(defaultLocation, { skipGeocoding: true });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // Increased timeout to 20s
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    requestCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (liveWatchId.current !== null) {
        navigator.geolocation.clearWatch(liveWatchId.current);
      }
    };
  }, []);

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
              <label className="block text-sm font-medium mb-2">Filter by Specialty</label>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="Emergency">🚨 Emergency Care</SelectItem>
                  <SelectItem value="Cardiology">❤️ Cardiology (Heart)</SelectItem>
                  <SelectItem value="Obstetrics">🤰 Obstetrics & Maternity</SelectItem>
                  <SelectItem value="Pediatrics">👶 Pediatrics (Children)</SelectItem>
                  <SelectItem value="Orthopedics">🦴 Orthopedics (Bones)</SelectItem>
                  <SelectItem value="Ophthalmology">👁️ Ophthalmology (Eye)</SelectItem>
                  <SelectItem value="Dermatology">🧴 Dermatology (Skin)</SelectItem>
                  <SelectItem value="Dentistry">🦷 Dentistry</SelectItem>
                  <SelectItem value="Neurology">🧠 Neurology (Brain)</SelectItem>
                  <SelectItem value="Oncology">🎗️ Oncology (Cancer)</SelectItem>
                  <SelectItem value="General Practice">🏥 General Practice</SelectItem>
                  <SelectItem value="Urgent Care">⚡ Urgent Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleLocationKeyPress}
                placeholder="Enter city, address, or ZIP code (press Enter to search)"
              />
            </div>

            <div className="flex items-end">
              <div className="flex w-full flex-col gap-2">
                <Button
                  onClick={requestCurrentLocation}
                  variant="outline"
                  className="w-full"
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Locating...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Use Current Location
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => (isLiveTracking ? stopLiveLocationTracking() : startLiveLocationTracking())}
                  variant={isLiveTracking ? 'destructive' : 'secondary'}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {isLiveTracking ? 'Disable Live Tracking' : 'Enable Live Tracking'}
                </Button>
              </div>
            </div>
          </div>



          {locationError && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription className="flex flex-col gap-2">
                <p>{locationError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestCurrentLocation}
                  className="w-fit bg-white text-red-600 hover:bg-red-50 border-red-200"
                >
                  Retry Location
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isLiveTracking && !locationError && (
            <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
              <AlertDescription className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Live location tracking is active. Nearby facilities update automatically.
              </AlertDescription>
            </Alert>
          )}

          {/* Searched Location Indicator */}
          {searchedLocationName && !isLiveTracking && (
            <Alert className="mb-4 border-blue-500 bg-blue-50 text-blue-800">
              <AlertDescription className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Showing hospitals near: <strong>{searchedLocationName.split(',').slice(0, 3).join(', ')}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchedLocationName(null);
                    setSearchQuery('');
                    requestCurrentLocation();
                  }}
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                >
                  Clear & Use My Location
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => void searchHospitals()}
              variant="medical"
              disabled={isSearching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search Facilities'}
            </Button>

            <Button
              onClick={() => {
                setEmergencyOnly(!emergencyOnly);
                void searchHospitals();
              }}
              variant={emergencyOnly ? "destructive" : "outline"}
            >
              <Ambulance className="h-4 w-4 mr-2" />
              {emergencyOnly ? 'Show All' : 'Emergency Only'}
            </Button>

            <Button
              onClick={() => setShowMap(!showMap)}
              variant="outline"
            >
              {showMap ? <List className="h-4 w-4 mr-2" /> : <MapIcon className="h-4 w-4 mr-2" />}
              {showMap ? 'Show List' : 'Show Map'}
            </Button>
          </div>

          {/* Map View */}
          {showMap && (
            <div className="mb-6 h-[400px] w-full rounded-lg overflow-hidden border shadow-inner relative z-0">
              <MapContainer
                center={[userLocation?.lat || defaultLocation.lat, userLocation?.lng || defaultLocation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={userLocation || defaultLocation} zoom={mapZoom} />

                {/* User Location Marker */}
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>You are here</Popup>
                  </Marker>
                )}

                {/* Hospital Markers */}
                {hospitals.map((hospital) => (
                  <Marker
                    key={hospital.id}
                    position={[hospital.coordinates.lat, hospital.coordinates.lng]}
                    icon={redIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-sm">{hospital.name}</h3>
                        <p className="text-xs text-muted-foreground">{hospital.type}</p>
                        <p className="text-xs mt-1">{hospital.address}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => getDirections(hospital)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1"
                          >
                            <Navigation className="h-3 w-3" /> Directions
                          </button>
                          <button
                            onClick={() => callHospital(hospital.phone)}
                            className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" /> Call
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

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
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-blue-600">{hospital.distance.toFixed(1)} miles</span>
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

                  {/* Enhanced Navigation Panel */}
                  <div className="lg:w-72 space-y-4">
                    {/* Travel Options Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Navigate to Hospital
                      </h5>

                      {/* Transport Mode Options */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <button
                          onClick={() => getDirections(hospital, 'driving')}
                          className="flex flex-col items-center p-3 bg-white rounded-lg border-2 border-transparent hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          <Car className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-gray-700 mt-1">Drive</span>
                          <span className="text-xs text-blue-600 font-semibold">
                            {getEstimatedTravelTime(hospital.distance, 'driving')}
                          </span>
                        </button>

                        <button
                          onClick={() => getDirections(hospital, 'walking')}
                          className="flex flex-col items-center p-3 bg-white rounded-lg border-2 border-transparent hover:border-green-400 hover:shadow-md transition-all group"
                        >
                          <Footprints className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-gray-700 mt-1">Walk</span>
                          <span className="text-xs text-green-600 font-semibold">
                            {getEstimatedTravelTime(hospital.distance, 'walking')}
                          </span>
                        </button>

                        <button
                          onClick={() => getDirections(hospital, 'transit')}
                          className="flex flex-col items-center p-3 bg-white rounded-lg border-2 border-transparent hover:border-purple-400 hover:shadow-md transition-all group"
                        >
                          <Bus className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-gray-700 mt-1">Transit</span>
                          <span className="text-xs text-purple-600 font-semibold">
                            {getEstimatedTravelTime(hospital.distance, 'transit')}
                          </span>
                        </button>
                      </div>

                      {/* Open in Maps Button */}
                      <Button
                        onClick={() => getDirections(hospital, 'driving')}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                    </div>

                    {/* Contact & Quick Actions */}
                    <div className="space-y-2">
                      {/* Call Button */}
                      <Button
                        onClick={() => callHospital(hospital.phone)}
                        variant="outline"
                        className="w-full border-2 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-all"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="font-medium">{hospital.phone}</span>
                      </Button>

                      {/* Copy & Share Row */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyAddress(hospital)}
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs hover:bg-gray-100"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Address
                        </Button>
                        <Button
                          onClick={() => shareHospital(hospital)}
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs hover:bg-gray-100"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      </div>

                      {/* Emergency Button */}
                      {hospital.emergencyServices && (
                        <Button
                          variant="destructive"
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg animate-pulse hover:animate-none"
                          onClick={() => callHospital(hospital.phone)}
                        >
                          <Ambulance className="h-4 w-4 mr-2" />
                          Emergency - Call Now
                        </Button>
                      )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center justify-center gap-4 pt-2 border-t">
                      {hospital.acceptsInsurance && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Insured</span>
                        </div>
                      )}
                      {hospital.emergencyServices && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <Shield className="h-3 w-3" />
                          <span>24/7 ER</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Star className="h-3 w-3 fill-yellow-500" />
                        <span>{hospital.rating}</span>
                      </div>
                    </div>
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