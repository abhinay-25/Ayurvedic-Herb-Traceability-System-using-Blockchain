"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  UserPlus, 
  MapPin, 
  Leaf, 
  CreditCard,
  CheckCircle
} from "lucide-react";

export default function RegisterFarmer() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    farmDetails: {
      farmName: '',
      farmSize: '',
      farmType: 'Conventional',
      soilType: '',
      irrigationType: ''
    },
    location: {
      latitude: '',
      longitude: ''
    },
    specializations: [] as string[],
    certifications: [] as Array<{ name: string; issuedBy: string; validUntil: string }>,
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: ''
    },
    walletAddress: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  const farmTypes = ['Organic', 'Conventional', 'Mixed'];
  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Chalky', 'Peaty'];
  const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Mixed'];
  const herbSpecializations = [
    'Ashwagandha', 'Turmeric', 'Neem', 'Tulsi', 'Brahmi', 'Arjuna',
    'Shatavari', 'Guduchi', 'Triphala herbs', 'Aloe Vera', 
    'Medicinal herbs', 'Aromatic herbs', 'Other'
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal'
  ];

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      else if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
    }
    
    if (stepNumber === 2) {
      if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
      if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
      if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
      if (!formData.address.pincode.trim()) newErrors['address.pincode'] = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.address.pincode)) {
        newErrors['address.pincode'] = 'Pincode must be 6 digits';
      }
      if (!formData.location.latitude || !formData.location.longitude) {
        newErrors.location = 'Location coordinates are required';
      }
    }
    
    if (stepNumber === 3) {
      if (!formData.farmDetails.farmName.trim()) newErrors['farmDetails.farmName'] = 'Farm name is required';
      if (!formData.farmDetails.farmSize || parseFloat(formData.farmDetails.farmSize) <= 0) {
        newErrors['farmDetails.farmSize'] = 'Valid farm size is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0] as keyof typeof prev] as Record<string, unknown>, [keys[1]]: value }
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specializations: checked 
        ? [...prev.specializations, specialization]
        : prev.specializations.filter(s => s !== specialization)
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6)
            }
          }));
          toast.success("Location captured successfully");
        },
        (error) => {
          toast.error("Could not get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      toast.error("Please fix the validation errors");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/farmers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          farmDetails: {
            ...formData.farmDetails,
            farmSize: parseFloat(formData.farmDetails.farmSize)
          },
          location: {
            latitude: parseFloat(formData.location.latitude),
            longitude: parseFloat(formData.location.longitude)
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Farmer registered successfully!");
        // Reset form
        setFormData({
          name: '', email: '', phone: '',
          address: { street: '', city: '', state: '', pincode: '' },
          farmDetails: { farmName: '', farmSize: '', farmType: 'Conventional', soilType: '', irrigationType: '' },
          location: { latitude: '', longitude: '' },
          specializations: [], certifications: [],
          bankDetails: { accountNumber: '', ifscCode: '', bankName: '', branchName: '' },
          walletAddress: '', notes: ''
        });
        setStep(1);
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <UserPlus className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Farmer Registration</h1>
          </div>
          <p className="text-gray-600">
            Register as a verified farmer to participate in the Ayurvedic herb traceability system.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Step {step} of 4: {
              step === 1 ? 'Personal Information' :
              step === 2 ? 'Address & Location' :
              step === 3 ? 'Farm Details' : 'Additional Information'
            }
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Enter your basic personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91XXXXXXXXXX"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Address & Location */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address & Location
                </CardTitle>
                <CardDescription>
                  Provide your address and farm location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Enter street address"
                    className={errors['address.street'] ? 'border-red-500' : ''}
                  />
                  {errors['address.street'] && <p className="text-sm text-red-500 mt-1">{errors['address.street']}</p>}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="City"
                      className={errors['address.city'] ? 'border-red-500' : ''}
                    />
                    {errors['address.city'] && <p className="text-sm text-red-500 mt-1">{errors['address.city']}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select 
                      value={formData.address.state} 
                      onValueChange={(value) => handleInputChange('address.state', value)}
                    >
                      <SelectTrigger className={errors['address.state'] ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['address.state'] && <p className="text-sm text-red-500 mt-1">{errors['address.state']}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className={errors['address.pincode'] ? 'border-red-500' : ''}
                    />
                    {errors['address.pincode'] && <p className="text-sm text-red-500 mt-1">{errors['address.pincode']}</p>}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Farm Location Coordinates *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Current Location
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        value={formData.location.latitude}
                        onChange={(e) => handleInputChange('location.latitude', e.target.value)}
                        placeholder="Latitude"
                        type="number"
                        step="0.000001"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.location.longitude}
                        onChange={(e) => handleInputChange('location.longitude', e.target.value)}
                        placeholder="Longitude"
                        type="number"
                        step="0.000001"
                      />
                    </div>
                  </div>
                  {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                </div>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Farm Details */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Farm Details
                </CardTitle>
                <CardDescription>
                  Provide information about your farm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="farmName">Farm Name *</Label>
                    <Input
                      id="farmName"
                      value={formData.farmDetails.farmName}
                      onChange={(e) => handleInputChange('farmDetails.farmName', e.target.value)}
                      placeholder="Enter farm name"
                      className={errors['farmDetails.farmName'] ? 'border-red-500' : ''}
                    />
                    {errors['farmDetails.farmName'] && <p className="text-sm text-red-500 mt-1">{errors['farmDetails.farmName']}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="farmSize">Farm Size (acres) *</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.farmDetails.farmSize}
                      onChange={(e) => handleInputChange('farmDetails.farmSize', e.target.value)}
                      placeholder="Enter farm size"
                      className={errors['farmDetails.farmSize'] ? 'border-red-500' : ''}
                    />
                    {errors['farmDetails.farmSize'] && <p className="text-sm text-red-500 mt-1">{errors['farmDetails.farmSize']}</p>}
                  </div>
                  
                  <div>
                    <Label>Farm Type *</Label>
                    <Select 
                      value={formData.farmDetails.farmType} 
                      onValueChange={(value) => handleInputChange('farmDetails.farmType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {farmTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Soil Type</Label>
                    <Select 
                      value={formData.farmDetails.soilType} 
                      onValueChange={(value) => handleInputChange('farmDetails.soilType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Irrigation Type</Label>
                    <Select 
                      value={formData.farmDetails.irrigationType} 
                      onValueChange={(value) => handleInputChange('farmDetails.irrigationType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select irrigation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {irrigationTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Herb Specializations</Label>
                  <p className="text-sm text-gray-600 mb-4">Select the herbs you specialize in growing</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {herbSpecializations.map(herb => (
                      <div key={herb} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={herb}
                          checked={formData.specializations.includes(herb)}
                          onChange={(e) => handleSpecializationChange(herb, e.target.checked)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <Label htmlFor={herb} className="text-sm">{herb}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Additional Information */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>
                  Optional information for better profile completion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
                  <Input
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                    placeholder="0x..."
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Ethereum wallet address for blockchain transactions
                  </p>
                </div>
                
                
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information about your farm or farming practices..."
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Registering..." : "Complete Registration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </Layout>
  );
}