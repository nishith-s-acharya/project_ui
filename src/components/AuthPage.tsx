import { useState,useEffect } from 'react';
import { ArrowLeft, User, Calendar, Heart, Baby, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
interface AuthPageProps {
  onBack: () => void;
  onComplete: (userData: UserData) => void;
}

interface UserData {
  name: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  isPregnant: boolean;
  medicalConditions: string[];
  emergencyContact: string;
  emergencyCountry: string;
}

const AuthPage = ({ onBack, onComplete }: AuthPageProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.unsafeMetadata?.detailsFilled) {
      navigate("/dashboard"); // ✅ Skip form if already filled
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState<UserData>({
  name: (user?.unsafeMetadata?.name as string) || '',
  age: (user?.unsafeMetadata?.age as string) || '',
  gender: (user?.unsafeMetadata?.gender as string) || '',
  email: (user?.unsafeMetadata?.email as string) || '',
  phone: (user?.unsafeMetadata?.phone as string) || '',
  isPregnant: (user?.unsafeMetadata?.isPregnant as boolean) || false,
  medicalConditions: (user?.unsafeMetadata?.medicalConditions as string[]) || [],
  emergencyContact: (user?.unsafeMetadata?.emergencyContact as string) || '',
  emergencyCountry: (user?.unsafeMetadata?.emergencyCountry as string) || '+91',
});
  
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emergencyContactError, setEmergencyContactError] = useState('');
  const [phoneCountry, setPhoneCountry] = useState({
    code: '+91',
    name: 'India',
    flag: '🇮🇳',
    length: 10
  });
  
  const [emergencyPhoneCountry, setEmergencyPhoneCountry] = useState({
    code: '+91',
    name: 'India',
    flag: '🇮🇳',
    length: 10
  });
  const [emergencyCountry, setEmergencyCountry] = useState({
    code: '+91',
    name: 'India',
    flag: '🇮🇳',
    length: 10
  });

  const countryCodes = [
    { code: '+91', name: 'India', flag: '🇮🇳', length: 10 },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸', length: 10 },
    { code: '+44', name: 'UK', flag: '🇬🇧', length: 10 },
    { code: '+81', name: 'Japan', flag: '🇯🇵', length: 10 },
    { code: '+86', name: 'China', flag: '🇨🇳', length: 11 },
    { code: '+33', name: 'France', flag: '🇫🇷', length: 9 },
    { code: '+49', name: 'Germany', flag: '🇩🇪', length: 10 },
    { code: '+971', name: 'UAE', flag: '🇦🇪', length: 9 },
    { code: '+65', name: 'Singapore', flag: '🇸🇬', length: 8 },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾', length: 9 },
    { code: '+61', name: 'Australia', flag: '🇦🇺', length: 9 },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const medicalConditionsList = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Asthma',
    'Allergies',
    'Arthritis',
    'Depression/Anxiety',
    'Other'
  ];

  const handleCountryChange = (country: typeof countryCodes[number], type: 'phone' | 'emergency' = 'phone') => {
    if (type === 'phone') {
      setPhoneCountry(country);
      // Re-validate phone number with new country code
      if (formData.phone) {
        const expectedLength = country.length;
        if (formData.phone.length < expectedLength) {
          setPhoneError(`Phone number should be ${expectedLength} digits for ${country.name}`);
        } else if (formData.phone.length > expectedLength) {
          setPhoneError(`Phone number should not exceed ${expectedLength} digits for ${country.name}`);
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
    } else {
      // Update both the emergency country state and form data
      setEmergencyCountry(country);
      
      // Use a functional update to ensure we have the latest state
      setFormData(prev => {
        const newFormData = {
          ...prev,
          emergencyCountry: country.code
        };
        
        // Validate with the new country's length requirements
        if (prev.emergencyContact) {
          const expectedLength = country.length;
          if (prev.emergencyContact.length > 0 && prev.emergencyContact.length < expectedLength) {
            setEmergencyContactError(`Phone number should be ${expectedLength} digits for ${country.name}`);
          } else if (prev.emergencyContact.length > expectedLength) {
            setEmergencyContactError(`Phone number should not exceed ${expectedLength} digits for ${country.name}`);
          } else if (!/^\d*$/.test(prev.emergencyContact)) {
            setEmergencyContactError('Only numbers are allowed');
          } else {
            setEmergencyContactError('');
          }
        } else {
          setEmergencyContactError('');
        }
        
        return newFormData;
      });
    }
  };

  const handleInputChange = (field: keyof UserData, value: string | boolean) => {
    // Handle age validation
    if (field === 'age' && typeof value === 'string') {
      const age = parseInt(value, 10);
      if (isNaN(age) || age < 1 || age > 120) {
        setAgeError('Please enter a valid age between 1 and 120');
      } else {
        setAgeError('');
      }
    }

    // Handle boolean fields
    if (field === 'isPregnant') {
      setFormData(prev => ({
        ...prev,
        [field]: value as boolean
      }));
      return;
    }
    
    // For string fields
    const stringValue = typeof value === 'string' ? value : String(value);
    
    // Update form data for string fields
    setFormData(prev => ({
      ...prev,
      [field]: stringValue
    }));
    
    // Field validation
    if (field === 'phone' || field === 'emergencyContact') {
      // Only allow numbers and update the form data
      if (stringValue === '' || /^\d*$/.test(stringValue)) {
        setFormData(prev => ({ ...prev, [field]: stringValue }));
        
        // Field-specific validation
        if (field === 'phone') {
          const expectedLength = phoneCountry.length;
          if (stringValue.length > 0 && stringValue.length < expectedLength) {
            setPhoneError(`Phone number should be ${expectedLength} digits for ${phoneCountry.name}`);
          } else if (stringValue.length > expectedLength) {
            setPhoneError(`Phone number should not exceed ${expectedLength} digits for ${phoneCountry.name}`);
          } else if (!/^\d*$/.test(stringValue)) {
            setPhoneError('Only numbers are allowed');
          } else {
            setPhoneError('');
          }
        } else if (field === 'emergencyContact') {
          // Get the current emergency country from state
          const currentCountry = countryCodes.find(c => c.code === formData.emergencyCountry) || emergencyCountry;
          const expectedLength = currentCountry.length;
          
          // First check if the input is empty or contains only digits
          if (stringValue === '' || /^\d*$/.test(stringValue)) {
            // Then validate the length based on country
            if (stringValue.length > 0 && stringValue.length < expectedLength) {
              setEmergencyContactError(`Phone number should be ${expectedLength} digits for ${currentCountry.name}`);
            } else if (stringValue.length > expectedLength) {
              setEmergencyContactError(`Phone number should not exceed ${expectedLength} digits for ${currentCountry.name}`);
            } else {
              setEmergencyContactError('');
            }
          } else {
            setEmergencyContactError('Only numbers are allowed');
          }
        }
      } else {
        if (field === 'phone') {
          setPhoneError('Only numbers are allowed');
        } else if (field === 'emergencyContact') {
          setEmergencyContactError('Only numbers are allowed');
        }
      }
      return;
    }
    
    // Name validation
    if (field === 'name') {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (stringValue && !nameRegex.test(stringValue)) {
        setNameError('Name can only contain letters and spaces');
      } else {
        setNameError('');
      }
    }
    
    // Email validation
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (stringValue && !emailRegex.test(stringValue)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: checked 
        ? [...prev.medicalConditions, condition]
        : prev.medicalConditions.filter(c => c !== condition)
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (currentStep < totalSteps) {
    setCurrentStep(prevStep => prevStep + 1);
  } else {
    const formattedData = {
      ...formData,
      phone: phoneCountry.code + formData.phone,
      emergencyContact: emergencyPhoneCountry.code + formData.emergencyContact
    };

    // ✅ Save to Clerk metadata
    if (user) {
      await user.update({
        unsafeMetadata: { detailsFilled: true, ...formattedData },
      });
    }

    onComplete(formattedData);
    navigate("/dashboard"); // ✅ Redirect to dashboard
  }
};

  const canProceed = () => {
    // Validate age is within reasonable range (1-120)
    const age = parseInt(formData.age, 10);
    const isAgeValid = !isNaN(age) && age >= 1 && age <= 120;
    
    switch (currentStep) {
      case 1:
        return formData.name && formData.age && formData.gender && !nameError && !ageError && isAgeValid;
      case 2:
        return formData.email && formData.phone.length === phoneCountry.length && !emailError && !phoneError;
      case 3:
        return formData.emergencyContact.length === emergencyPhoneCountry.length && !emergencyContactError;
      default:
        return false;
    }
  };

  // Import the medical background image
  const medicalHeroBg = new URL('@/assets/medical-hero-bg.jpg', import.meta.url).href;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${medicalHeroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80"></div>
      </div>
      
      <div className="w-full max-w-2xl relative z-10 px-4">
        <div className="relative mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="absolute left-0 top-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to AIDA</h1>
            <p className="text-muted-foreground">
              Let's gather some information to provide you with personalized healthcare assistance
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
          <CardHeader className="bg-transparent">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              {currentStep === 1 && (
                <>
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Calendar className="h-5 w-5" />
                  <span>Contact & Health Details</span>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Heart className="h-5 w-5" />
                  <span>Medical History</span>
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center">
              Step {currentStep} of {totalSteps}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6 p-8 bg-white/80 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className={nameError ? 'border-red-500' : ''}
                      />
                      {nameError && (
                        <p className="text-sm text-red-500 mt-1">{nameError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Enter your age"
                        required
                        className={ageError ? 'border-red-500' : ''}
                      />
                      {ageError && (
                        <p className="text-sm text-red-500 mt-1">{ageError}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Gender</Label>
                    <RadioGroup 
                      value={formData.gender} 
                      onValueChange={(value) => handleInputChange('gender', value as string)}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.gender === 'female' && (
                    <div className="flex items-center space-x-2 p-4 bg-secondary/20 rounded-lg">
                      <Checkbox
                        id="pregnant"
                        checked={formData.isPregnant}
                        onCheckedChange={(checked) => handleInputChange('isPregnant', checked)}
                      />
                      <Label htmlFor="pregnant" className="flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Currently pregnant
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-slide-up">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email address"
                        className={emailError ? 'border-red-500' : ''}
                        required
                      />
                      {emailError && (
                        <p className="text-sm text-red-500 mt-1">{emailError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-[120px] justify-between"
                            >
                              <span>{phoneCountry.flag} {phoneCountry.code}</span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <div className="max-h-[300px] overflow-auto">
                              {countryCodes.map((country) => (
                                <div
                                  key={`phone-${country.code}`}
                                  className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleCountryChange(country)}
                                >
                                  <span>{country.flag}</span>
                                  <span>{country.name}</span>
                                  <span className="ml-auto text-muted-foreground">{country.code}</span>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <div className="relative flex-1">
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            placeholder={`Enter ${phoneCountry.length}-digit number`}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="1234567890"
                            className={`pl-3 ${phoneError ? 'border-red-500' : ''}`}
                            required
                          />
                        </div>
                      </div>
                      {phoneError && (
                        <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Medical History */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-slide-up">
                  <div>
                    <Label>Existing Medical Conditions</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {medicalConditionsList.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={condition}
                            checked={formData.medicalConditions.includes(condition)}
                            onCheckedChange={(checked) => 
                              handleMedicalConditionChange(condition, !!checked)
                            }
                          />
                          <Label htmlFor={condition} className="text-sm">
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-[120px] justify-between"
                          >
                            <span>{emergencyPhoneCountry.flag} {emergencyPhoneCountry.code}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <div className="max-h-[300px] overflow-auto">
                            {countryCodes.map((country) => (
                              <div
                                key={`emergency-${country.code}`}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setEmergencyPhoneCountry(country);
                                  setFormData(prev => ({
                                    ...prev,
                                    emergencyCountry: country.code
                                  }));
                                  // Re-validate with new country
                                  if (formData.emergencyContact) {
                                    if (formData.emergencyContact.length < country.length) {
                                      setEmergencyContactError(`Phone number should be ${country.length} digits for ${country.name}`);
                                    } else if (formData.emergencyContact.length > country.length) {
                                      setEmergencyContactError(`Phone number should not exceed ${country.length} digits for ${country.name}`);
                                    } else {
                                      setEmergencyContactError('');
                                    }
                                  }
                                }}
                              >
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="ml-auto text-muted-foreground">{country.code}</span>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="relative flex-1">
                        <Input
                          id="emergencyContact"
                          type="tel"
                          value={formData.emergencyContact}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d*$/.test(value)) {
                              setFormData(prev => ({
                                ...prev,
                                emergencyContact: value
                              }));
                              
                              if (value.length > 0 && value.length < emergencyPhoneCountry.length) {
                                setEmergencyContactError(`Phone number should be ${emergencyPhoneCountry.length} digits for ${emergencyPhoneCountry.name}`);
                              } else if (value.length > emergencyPhoneCountry.length) {
                                setEmergencyContactError(`Phone number should not exceed ${emergencyPhoneCountry.length} digits for ${emergencyPhoneCountry.name}`);
                              } else {
                                setEmergencyContactError('');
                              }
                            }
                          }}
                          placeholder="1234567890"
                          className={`pl-3 ${emergencyContactError ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                    </div>
                    {emergencyContactError && (
                      <p className="text-sm text-red-500 mt-1">{emergencyContactError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                <Button
                  type="submit"
                  variant="medical"
                  disabled={!canProceed()}
                >
                  {currentStep === totalSteps ? 'Complete Setup' : 'Next Step'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;