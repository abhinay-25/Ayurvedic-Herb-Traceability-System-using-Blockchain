"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { WalletStatus } from "@/components/WalletConnection";
import dynamic from 'next/dynamic';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Upload, Leaf, User, Wallet } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { contractConfig } from '@/lib/wagmi';
import { getGasConfig } from '@/lib/gasUtils';
import { toast } from "sonner";

// Dynamically import LocationSelector to avoid SSR issues
const LocationSelector = dynamic(
  () => import('@/components/maps').then((mod) => ({ default: mod.LocationSelector })),
  { 
    ssr: false,
    loading: () => <p>Loading map...</p>
  }
);

const formSchema = z.object({
  name: z.string().min(2, "Herb name must be at least 2 characters"),
  scientificName: z.string().min(2, "Scientific name must be at least 2 characters"),
  origin: z.string().min(2, "Origin must be at least 2 characters"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  farmerName: z.string().min(2, "Farmer name must be at least 2 characters"),
  farmerContact: z.string().min(10, "Valid contact number is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  locationAddress: z.string().optional(),
  description: z.string().optional(),
  variety: z.string().min(1, "Variety is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddHerbPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number; address?: string} | null>(null);
  const [useBlockchain, setUseBlockchain] = useState(false);

  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      scientificName: "",
      origin: "",
      harvestDate: "",
      farmerName: "",
      farmerContact: "",
      latitude: "",
      longitude: "",
      locationAddress: "",
      description: "",
      variety: "",
      quantity: "",
      unit: "kg",
    },
  });

  // Handle location selection from map
  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setSelectedLocation(location);
    form.setValue("latitude", location.lat.toString());
    form.setValue("longitude", location.lng.toString());
    form.setValue("locationAddress", location.address || "");
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // First, add to backend API (always happens)
      console.log("Form data:", data);
      console.log("Images:", selectedImages);
      
      // Mock API call to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log("API URL:", apiUrl);
      
      const response = await fetch(`${apiUrl}/api/herbs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Instruct backend to skip on-chain write when frontend will handle it
          'x-skip-blockchain': (useBlockchain && isConnected && address) ? '1' : '0',
        },
        body: JSON.stringify({
          herbId: `${data.name.toUpperCase().substring(0,3)}-${Date.now()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`,
          name: data.name,
          collector: data.farmerName, // API expects 'collector' not 'farmerName'
          geoTag: {
            latitude: parseFloat(data.latitude || "0"),
            longitude: parseFloat(data.longitude || "0"),
            location: data.locationAddress || data.origin
          },
          harvestDate: data.harvestDate,
          quantity: parseFloat(data.quantity),
          unit: data.unit,
          quality: 'A', // Default quality grade
          // Additional fields that might be useful
          scientificName: data.scientificName,
          origin: data.origin,
          farmerContact: data.farmerContact,
          description: data.description,
          variety: data.variety,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", response.status, errorText);
        throw new Error(`Failed to add herb to backend: ${response.status} - ${errorText}`);
      }

      const herbResponse = await response.json();
      console.log("Herb added:", herbResponse);
      toast.success("Herb added to database successfully!");

      // Optionally add to blockchain if wallet is connected and user chooses
      if (useBlockchain && isConnected && address && herbResponse.data) {
        try {
          const herb = herbResponse.data;
          const gasConfig = getGasConfig('addHerb');
          
          // @ts-ignore - Wagmi types can be complex
          writeContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'addHerb',
            args: [
              herb.herbId,
              herb.name,
              herb.collector,
              `${herb.geoTag.latitude},${herb.geoTag.longitude}`,
              herb.status || 'Collected'
            ],
            ...gasConfig,
          });
          toast.success("Blockchain transaction initiated!");
        } catch (blockchainError) {
          console.error("Blockchain error:", blockchainError);
          toast.error("Blockchain transaction failed, but herb saved to database");
        }
      }
      
      // Reset form on success
      form.reset();
      setSelectedImages([]);
      setUseBlockchain(false);
    } catch (err) {
      console.error("Error submitting form:", err);
      
      const error = err as Error;
      
      // More specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Cannot connect to server. Please ensure the backend is running.");
      } else if (error.message.includes('CORS')) {
        toast.error("Cross-origin request blocked. Check server CORS settings.");
      } else if (error.message.includes('Failed to add herb to backend')) {
        toast.error("Server error: " + error.message);
      } else {
        toast.error("Error adding herb: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const herbVarieties = [
    "Wild",
    "Cultivated",
    "Organic",
    "Traditional",
    "Hybrid"
  ];

  const units = ["kg", "g", "tons", "pounds"];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Herb</h1>
          <p className="text-gray-600 mb-4">
            Register a new Ayurvedic herb in the blockchain traceability system
          </p>
          <WalletStatus />
        </div>

        {/* Blockchain Option */}
        {isConnected && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-blue-600" />
                Blockchain Integration
              </CardTitle>
              <CardDescription>
                Choose whether to record this herb on the Avalanche Fuji blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useBlockchain"
                  checked={useBlockchain}
                  onChange={(e) => setUseBlockchain(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <Label htmlFor="useBlockchain" className="text-sm font-medium">
                  Record on blockchain (requires wallet signature)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="mr-2 h-5 w-5 text-green-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the basic details about the herb
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Herb Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ashwagandha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scientificName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scientific Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Withania somnifera" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="variety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variety</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select variety" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {herbVarieties.map((variety) => (
                              <SelectItem key={variety} value={variety}>
                                {variety}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Additional details about the herb..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Farmer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Farmer Information
                </CardTitle>
                <CardDescription>
                  Details about the farmer who cultivated this herb
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="farmerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farmer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ravi Kumar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="farmerContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., +91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin/Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Karnataka, India" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="harvestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harvest Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Selection */}
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              className="w-full"
            />

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5 text-purple-600" />
                  Documentation
                </CardTitle>
                <CardDescription>
                  Upload images for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="images">Herb Images</Label>
                  <div className="mt-1">
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("images")?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Images
                    </Button>
                  </div>
                  {selectedImages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {selectedImages.length} image(s) selected
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedImages.map((file, index) => (
                          <Badge key={index} variant="secondary">
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isPending || isConfirming}
                className="min-w-[200px]"
              >
                {isPending ? (
                  "Waiting for signature..."
                ) : isConfirming ? (
                  "Confirming transaction..."
                ) : isSubmitting ? (
                  "Submitting..."
                ) : useBlockchain && isConnected ? (
                  "Add to Database & Blockchain"
                ) : (
                  "Add Herb to Database"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}