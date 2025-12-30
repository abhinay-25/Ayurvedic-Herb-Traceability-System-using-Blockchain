"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layout } from "../../../components/Layout";
import { HerbJourneyTimeline } from "../../../components/HerbJourneyTimeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, User, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface HerbJourneyStep {
  id: number;
  status: string;
  geoTag: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: number;
  txHash: string;
  location: string;
  description: string;
  updatedBy: string;
  stage: {
    name: string;
    icon: string;
    color: string;
    description: string;
  };
  stepNumber: number;
  isCurrentStep: boolean;
  isCompleted: boolean;
}

interface HerbHistoryData {
  herbId: string;
  name: string;
  scientificName: string;
  collector: string;
  harvestDate: string;
  currentStatus: string;
  totalSteps: number;
  journey: HerbJourneyStep[];
  blockchain: any;
  metadata: {
    batchId: number | null;
    quality: string;
    quantity: number;
    unit: string;
  };
}

export default function HerbDetailsPage() {
  const params = useParams();
  const herbId = params.id as string;
  
  const [herbData, setHerbData] = useState<HerbHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (herbId) {
      fetchHerbHistory();
    }
  }, [herbId]);

  const fetchHerbHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/herbs/${herbId}/history`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch herb history: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setHerbData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch herb history');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('collect') || statusLower.includes('harvest')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('process')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('pack')) return 'bg-orange-100 text-orange-800';
    if (statusLower.includes('formul') || statusLower.includes('final')) return 'bg-purple-100 text-purple-800';
    if (statusLower.includes('deliver')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Herb Details</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={fetchHerbHistory}>Try Again</Button>
              <Button variant="outline" asChild>
                <Link href="/herbs">Back to Herbs</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!herbData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-gray-400 text-6xl mb-4">🌿</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Herb Not Found</h2>
            <p className="text-gray-600 mb-6">The requested herb with ID "{herbId}" could not be found.</p>
            <Button variant="outline" asChild>
              <Link href="/herbs">Back to Herbs</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/herbs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Herbs
            </Link>
          </Button>
          <div className="h-6 border-l border-gray-300" />
          <h1 className="text-3xl font-bold text-gray-900">Herb Traceability Journey</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌿 {herbData.name}
                  <Badge className={getStatusColor(herbData.currentStatus)}>
                    {herbData.currentStatus}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Complete traceability journey from collection to final formulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HerbJourneyTimeline journey={herbData.journey} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Herb Details */}
            <Card>
              <CardHeader>
                <CardTitle>Herb Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Herb ID:</span>
                    <span className="text-sm font-mono">{herbData.herbId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium">{herbData.name}</span>
                  </div>
                  {herbData.scientificName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Scientific:</span>
                      <span className="text-sm italic">{herbData.scientificName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Collector:</span>
                    <span className="text-sm">{herbData.collector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Harvest Date:</span>
                    <span className="text-sm">{new Date(herbData.harvestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm">{herbData.metadata.quantity} {herbData.metadata.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quality:</span>
                    <Badge variant="outline">{herbData.metadata.quality}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Journey Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Journey Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Steps:</span>
                    <span className="text-sm font-medium">{herbData.totalSteps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Stage:</span>
                    <Badge className={getStatusColor(herbData.currentStatus)}>
                      {herbData.currentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completion:</span>
                    <span className="text-sm font-medium">
                      {Math.round((herbData.journey.filter(j => j.isCompleted).length / herbData.totalSteps) * 100)}%
                    </span>
                  </div>
                  {herbData.metadata.batchId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Batch ID:</span>
                      <span className="text-sm font-mono">#{herbData.metadata.batchId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Info */}
            {herbData.blockchain && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔗 Blockchain Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    This herb's journey is recorded on the Avalanche Fuji testnet for transparency and immutability.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a 
                      href="https://testnet.snowtrace.io/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Snowtrace
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}