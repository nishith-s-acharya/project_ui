import { useState } from 'react';
import { Calendar, Clock, User, Star, MapPin, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DoctorBookingSectionProps {
  userData: {
    name: string;
    age: string;
    gender: string;
    isPregnant: boolean;
    medicalConditions: string[];
  };
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  location: string;
  availableSlots: string[];
  consultationFee: number;
  image: string;
  languages: string[];
  consultationType: ('in-person' | 'video' | 'both')[];
}

interface Booking {
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  status: 'confirmed' | 'pending';
}

const DoctorBookingSection = ({ userData }: DoctorBookingSectionProps) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample doctors database
  const doctorsDatabase: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'General Medicine',
      rating: 4.8,
      experience: 12,
      location: 'Downtown Medical Center',
      availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'],
      consultationFee: 150,
      image: '/api/placeholder/100/100',
      languages: ['English', 'Spanish'],
      consultationType: ['in-person', 'video']
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      rating: 4.9,
      experience: 18,
      location: 'Heart Care Clinic',
      availableSlots: ['08:00 AM', '11:00 AM', '01:00 PM'],
      consultationFee: 250,
      image: '/api/placeholder/100/100',
      languages: ['English', 'Mandarin'],
      consultationType: ['in-person', 'video']
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Obstetrics & Gynecology',
      rating: 4.7,
      experience: 15,
      location: 'Women\'s Health Center',
      availableSlots: ['09:30 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
      consultationFee: 200,
      image: '/api/placeholder/100/100',
      languages: ['English', 'Spanish'],
      consultationType: ['in-person', 'video']
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'Psychiatry',
      rating: 4.6,
      experience: 10,
      location: 'Mental Health Associates',
      availableSlots: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'],
      consultationFee: 180,
      image: '/api/placeholder/100/100',
      languages: ['English'],
      consultationType: ['video', 'in-person']
    }
  ];

  const specialties = [
    'General Medicine',
    'Cardiology',
    'Obstetrics & Gynecology',
    'Psychiatry',
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'Endocrinology'
  ];

  const getRecommendedSpecialty = () => {
    if (userData.isPregnant) return 'Obstetrics & Gynecology';
    if (userData.medicalConditions.includes('Diabetes')) return 'Endocrinology';
    if (userData.medicalConditions.includes('Hypertension') || userData.medicalConditions.includes('Heart Disease')) return 'Cardiology';
    if (userData.medicalConditions.includes('Depression/Anxiety')) return 'Psychiatry';
    return 'General Medicine';
  };

  const searchDoctors = () => {
    setIsSearching(true);
    setTimeout(() => {
      let filtered = doctorsDatabase;
      
      if (selectedSpecialty) {
        filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
      } else {
        // Show recommended specialists based on user profile
        const recommendedSpecialty = getRecommendedSpecialty();
        filtered = filtered.filter(doctor => 
          doctor.specialty === recommendedSpecialty || doctor.specialty === 'General Medicine'
        );
      }
      
      setDoctors(filtered);
      setIsSearching(false);
    }, 1000);
  };

  const bookAppointment = (doctor: Doctor, slot: string, type: 'in-person' | 'video') => {
    const newBooking: Booking = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: selectedDate || new Date().toISOString().split('T')[0],
      time: slot,
      type,
      status: 'confirmed'
    };
    
    setBookings(prev => [...prev, newBooking]);
    
    // Remove the booked slot from available slots
    setDoctors(prev => prev.map(d => 
      d.id === doctor.id 
        ? { ...d, availableSlots: d.availableSlots.filter(s => s !== slot) }
        : d
    ));
  };

  // Auto-search on component mount
  useState(() => {
    searchDoctors();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Doctor Appointments
          </CardTitle>
          <CardDescription className="text-white/80">
            Book appointments with qualified healthcare professionals
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Specialty</label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <Button 
            onClick={searchDoctors}
            variant="medical"
            disabled={isSearching}
            className="w-full md:w-auto"
          >
            {isSearching ? 'Searching...' : 'Search Doctors'}
          </Button>

          {/* Recommendations */}
          <Alert className="mt-4">
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended specialty for you:</strong> {getRecommendedSpecialty()}
              {userData.isPregnant && ' (Based on your pregnancy status)'}
              {userData.medicalConditions.length > 0 && ' (Based on your medical conditions)'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Current Bookings */}
      {bookings.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
            <CardDescription>Upcoming scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {booking.type === 'video' ? <Video className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{booking.doctorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.date} at {booking.time} ({booking.type === 'video' ? 'Video Call' : 'In-Person'})
                      </p>
                    </div>
                  </div>
                  <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      {doctors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Doctors</h3>
          
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-primary">{doctor.name}</h4>
                        <p className="text-muted-foreground">{doctor.specialty}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{doctor.rating}</span>
                          </div>
                          <span>{doctor.experience} years experience</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {doctor.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">${doctor.consultationFee}</p>
                        <p className="text-sm text-muted-foreground">Consultation fee</p>
                      </div>
                    </div>

                    {/* Languages & Consultation Types */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doctor.languages.map(lang => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                      {doctor.consultationType.includes('video') && (
                        <Badge variant="secondary">
                          <Video className="h-3 w-3 mr-1" />
                          Video Calls
                        </Badge>
                      )}
                      {doctor.consultationType.includes('in-person') && (
                        <Badge variant="secondary">
                          <MapPin className="h-3 w-3 mr-1" />
                          In-Person
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Available Slots */}
                  <div className="md:w-80">
                    <h5 className="font-medium mb-3">Available Today</h5>
                    {doctor.availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {doctor.availableSlots.map((slot) => (
                          <div key={slot} className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => bookAppointment(doctor, slot, 'in-person')}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {slot}
                            </Button>
                            {doctor.consultationType.includes('video') && (
                              <Button
                                variant="outline-medical"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => bookAppointment(doctor, slot, 'video')}
                              >
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No slots available today</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorBookingSection;