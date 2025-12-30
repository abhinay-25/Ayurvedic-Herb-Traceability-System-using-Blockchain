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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Package, MapPin, Wallet, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { contractConfig } from '@/lib/wagmi';
import { getGasConfig } from '@/lib/gasUtils';
import { toast } from "sonner";

const formSchema = z.object({
  herbId: z.string().min(1, "Herb ID is required"),
  status: z.string().min(1, "Status is required"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  notes: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function UpdateStatusPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "getting" | "success" | "error">("idle");
  const [useBlockchain, setUseBlockchain] = useState(false);
  const [herbDetails, setHerbDetails] = useState<any>(null);

  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      herbId: "",
      status: "",
      location: "",
      notes: "",
      latitude: "",
      longitude: "",
    },
  });

  const statusOptions = [
    { value: "Collected", label: "Collected", color: "secondary" },
    { value: "In Processing", label: "In Processing", color: "info" },
    { value: "Packaged", label: "Packaged", color: "success" },
    { value: "Final Formulation", label: "Final Formulation", color: "warning" },
    { value: "Distributed", label: "Distributed", color: "default" },
  ];

  const getCurrentLocation = () => {
    setLocationStatus("getting");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude.toString());
          form.setValue("longitude", position.coords.longitude.toString());
          setLocationStatus("success");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus("error");
        }
      );
    } else {
      setLocationStatus("error");
    }
  };

  const lookupHerb = async (herbId: string) => {
    if (!herbId) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/herbs/${herbId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setHerbDetails(result.data);
          toast.success("Herb found!");
        } else {
          setHerbDetails(null);
          toast.error("Herb not found");
        }
      } else {
        setHerbDetails(null);
        toast.error("Herb not found");
      }
    } catch (error) {
      console.error("Error looking up herb:", error);
      setHerbDetails(null);
      toast.error("Error looking up herb");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // First, update backend API (always happens)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/herbs/${data.herbId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-skip-blockchain': (useBlockchain && isConnected && address) ? '1' : '0',
        },
        body: JSON.stringify({
          status: data.status,
          location: data.location,
          notes: data.notes,
          latitude: data.latitude,
          longitude: data.longitude,
          updatedBy: address || 'anonymous',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend error:', errorData);
        throw new Error(`Failed to update herb status: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      toast.success("Herb status updated in database!");

      // Optionally update blockchain if wallet is connected and user chooses
      if (useBlockchain && isConnected && address) {
        try {
          // Ensure herb exists on-chain; if not, add it first using backend details
          let existsOnChain = true;
          try {
            // Use getLatestStatus which exists in ABI to probe existence
            // @ts-ignore - Wagmi types can be complex
            await publicClient?.readContract({
              address: contractConfig.address,
              abi: contractConfig.abi,
              functionName: 'getLatestStatus',
              args: [data.herbId],
            });
          } catch (_) {
            existsOnChain = false;
          }

          // Fetch details if we don't already have them
          if (!existsOnChain) {
            const id = data.herbId;
            let details = herbDetails;
            if (!details) {
              const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/herbs/${id}`);
              if (resp.ok) {
                const result = await resp.json();
                details = result?.data;
              }
            }
            if (!details || !details.name || !details.collector || !details.geoTag) {
              throw new Error('Herb not found on-chain and insufficient data to add it automatically. Please add it on-chain first.');
            }

            const geo = `${details.geoTag.latitude},${details.geoTag.longitude}`;
            const addGas = getGasConfig('addHerb');

            // @ts-ignore - Wagmi types can be complex
            writeContract({
              address: contractConfig.address,
              abi: contractConfig.abi,
              functionName: 'addHerb',
              args: [id, details.name, details.collector, geo, details.status || 'Collected'],
              ...addGas,
            });
            
            // Wait for user to approve and transaction to be mined
            toast.info('Please approve the add herb transaction in your wallet...');
            
            // Give a moment for the tx to be submitted before proceeding
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          const updGas = getGasConfig('updateStatus');
          
          // @ts-ignore - Wagmi types can be complex
          writeContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'updateStatus',
            args: [data.herbId, data.status],
            ...updGas,
          });
          
          toast.info('Please approve the status update transaction in your wallet...');
        } catch (blockchainError) {
          console.error("Blockchain error:", blockchainError);
          toast.error("Blockchain transaction failed, but status updated in database");
        }
      }
      
      // Reset form on success
      form.reset();
      setHerbDetails(null);
      setUseBlockchain(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating herb status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Update Herb Status</h1>
          <p className="text-gray-600 mb-4">
            Update the supply chain status of an existing herb
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
                Choose whether to record this status update on the Avalanche Fuji blockchain
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
            {/* Herb Lookup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-green-600" />
                  Herb Identification
                </CardTitle>
                <CardDescription>
                  Enter the herb ID to update its status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="herbId"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Herb ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., HRB001" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value.length >= 3) {
                                lookupHerb(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => lookupHerb(form.getValues("herbId"))}
                      className="w-full"
                    >
                      Lookup Herb
                    </Button>
                  </div>
                </div>

                {/* Herb Details Display */}
                {herbDetails && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Herb Found:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {herbDetails.name}</div>
                      <div><strong>Scientific Name:</strong> {herbDetails.scientificName || 'N/A'}</div>
                      <div><strong>Farmer:</strong> {herbDetails.collector}</div>
                      <div><strong>Origin:</strong> {herbDetails.geoTag ? `${herbDetails.geoTag.latitude}, ${herbDetails.geoTag.longitude}` : 'N/A'}</div>
                      <div><strong>Current Status:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {herbDetails.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                  Status Update
                </CardTitle>
                <CardDescription>
                  Update the current status of the herb in the supply chain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Processing Facility, Mumbai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Additional notes about this status update..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-purple-600" />
                  Location Tracking
                </CardTitle>
                <CardDescription>
                  Record the current GPS coordinates for this status update
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Auto-filled" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Auto-filled" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={locationStatus === "getting"}
                      className="w-full"
                    >
                      {locationStatus === "getting" ? (
                        "Getting Location..."
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Get Location
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {locationStatus === "success" && (
                  <Badge variant="success" className="w-fit">
                    Location captured successfully
                  </Badge>
                )}

                {locationStatus === "error" && (
                  <Badge variant="destructive" className="w-fit">
                    Failed to get location. Please enable location services.
                  </Badge>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancel
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
                  "Updating..."
                ) : useBlockchain && isConnected ? (
                  "Update Database & Blockchain"
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}