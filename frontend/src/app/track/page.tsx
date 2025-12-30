"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Users, 
  Leaf, 
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  Eye
} from "lucide-react";

interface TraceabilityData {
  overview: {
    totalHerbs: number;
    totalFarmers: number;
    totalTransactions: number;
    activeSupplyChains: number;
  };
  distribution: {
    byStatus: Array<{ _id: string; count: number }>;
    byLocation: Array<{ _id: string; count: number; farmersCount: number }>;
    byQuality: Array<{ _id: string; count: number; avgQuantity: number }>;
  };
  recentActivities: Array<{
    herbId: string;
    name: string;
    currentStatus: string;
    collector: { name: string; farmerId: string };
    harvestDate: string;
    updatedAt: string;
  }>;
}

interface HerbJourney {
  herb: {
    herbId: string;
    name: string;
    currentStatus: string;
    quality: string;
    quantity: string;
    harvestDate: string;
  };
  farmer: {
    farmerId: string;
    name: string;
    farmName: string;
    location: string;
    verificationStatus: string;
    specializations: string[];
  } | null;
  journey: {
    timeline: Array<{
      stage: string;
      date: string;
      location: string;
      actor: string;
      details: any;
    }>;
    metrics: {
      totalStages: number;
      journeyDuration: string;
      completionPercentage: string;
    };
  };
  blockchain: {
    transactionHash: string;
    contractAddress: string;
    network: string;
  };
}

export default function Track() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('herb');
  const [loading, setLoading] = useState(false);
  const [traceabilityData, setTraceabilityData] = useState<TraceabilityData | null>(null);
  const [herbJourney, setHerbJourney] = useState<HerbJourney | null>(null);
  const [showJourney, setShowJourney] = useState(false);

  useEffect(() => {
    loadTraceabilityOverview();
  }, []);

  const loadTraceabilityOverview = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/traceability`);
      const result = await response.json();
      
      if (result.success) {
        setTraceabilityData(result.data);
      }
    } catch (error) {
      console.error('Error loading traceability data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    setShowJourney(false);
    setHerbJourney(null);

    try {
      if (searchType === 'herb') {
        // Search for herb journey
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/traceability/herb/${searchQuery.trim()}`
        );
        const result = await response.json();

        if (result.success) {
          setHerbJourney(result.data);
          setShowJourney(true);
          toast.success("Herb journey loaded successfully");
        } else {
          toast.error(result.error || "Herb not found");
        }
      } else if (searchType === 'farmer') {
        // Search for farmer herbs
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/herbs?collector=${searchQuery.trim()}&limit=20`
        );
        const result = await response.json();

        if (result.success && result.data.herbs.length > 0) {
          toast.success(`Found ${result.data.herbs.length} herbs from farmer ${searchQuery}`);
          // You can implement farmer's herbs display here
        } else {
          toast.error("No herbs found for this farmer");
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "Harvested": "secondary",
      "Collected": "secondary", 
      "Processing": "warning",
      "In Processing": "warning",
      "Quality Tested": "success",
      "In Transit": "info",
      "Shipped": "info",
      "Delivered": "success",
      "Final Formulation": "success"
    } as const;
    
    return (
      <Badge variant={statusColors[status as keyof typeof statusColors] || "outline"}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQualityColor = (quality: string) => {
    const colors = {
      'A': 'text-green-600',
      'B': 'text-blue-600', 
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
    };
    return colors[quality as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Traceability Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Track and verify the complete journey of Ayurvedic herbs from farm to final product.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Item
            </CardTitle>
            <CardDescription>
              Enter herb ID, farmer ID, or transaction hash to track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="searchQuery" className="sr-only">Search Query</Label>
                <Input
                  id="searchQuery"
                  placeholder="Enter herb ID (e.g., HRB001) or farmer ID..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="w-40">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="herb">Herb ID</SelectItem>
                    <SelectItem value="farmer">Farmer ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Searching..." : "Track"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Journey Details */}
        {showJourney && herbJourney && (
          <div className="mb-8 space-y-6">
            {/* Herb Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    {herbJourney.herb.name} ({herbJourney.herb.herbId})
                  </span>
                  {getStatusBadge(herbJourney.herb.currentStatus)}
                </CardTitle>
                <CardDescription>
                  Complete traceability information and journey timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Quality Grade</Label>
                    <p className={`text-lg font-semibold ${getQualityColor(herbJourney.herb.quality)}`}>
                      Grade {herbJourney.herb.quality}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Quantity</Label>
                    <p className="text-lg font-semibold">{herbJourney.herb.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Harvest Date</Label>
                    <p className="text-lg font-semibold">{formatDate(herbJourney.herb.harvestDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Journey Progress</Label>
                    <p className="text-lg font-semibold text-green-600">
                      {herbJourney.journey.metrics.completionPercentage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farmer Information */}
            {herbJourney.farmer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Farmer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Name</Label>
                        <p className="font-semibold">{herbJourney.farmer.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Farmer ID</Label>
                        <p>{herbJourney.farmer.farmerId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Farm Name</Label>
                        <p>{herbJourney.farmer.farmName}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Location</Label>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {herbJourney.farmer.location}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Verification Status</Label>
                        <Badge variant={herbJourney.farmer.verificationStatus === 'Verified' ? 'success' : 'warning'}>
                          {herbJourney.farmer.verificationStatus}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Specializations</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {herbJourney.farmer.specializations?.map(spec => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Journey Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Journey Timeline
                </CardTitle>
                <CardDescription>
                  Complete tracking history from farm to final destination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {herbJourney.journey.timeline.map((stage, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">{stage.stage}</h4>
                          <span className="text-sm text-gray-500">{formatDate(stage.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Location:</strong> {stage.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Actor:</strong> {stage.actor}
                        </p>
                        {stage.details && Object.keys(stage.details).length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                            {Object.entries(stage.details).map(([key, value]) => 
                              value ? (
                                <span key={key} className="inline-block mr-4">
                                  <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {String(value)}
                                </span>
                              ) : null
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Blockchain Verification
                </CardTitle>
                <CardDescription>
                  Immutable record on Avalanche Fuji Testnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Transaction Hash</Label>
                    <p className="font-mono text-sm break-all">
                      {herbJourney.blockchain.transactionHash || 'Not yet recorded'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Smart Contract</Label>
                    <p className="font-mono text-sm break-all">{herbJourney.blockchain.contractAddress}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Network</Label>
                    <p>{herbJourney.blockchain.network}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Journey Duration</Label>
                    <p className="font-semibold">{herbJourney.journey.metrics.journeyDuration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overview Statistics */}
        {traceabilityData && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">System Overview</h2>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Leaf className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Herbs</p>
                      <p className="text-2xl font-bold">{traceabilityData.overview.totalHerbs.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Verified Farmers</p>
                      <p className="text-2xl font-bold">{traceabilityData.overview.totalFarmers.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Transactions</p>
                      <p className="text-2xl font-bold">{traceabilityData.overview.totalTransactions.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-emerald-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Chains</p>
                      <p className="text-2xl font-bold">{traceabilityData.overview.activeSupplyChains}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest herb tracking activities across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {traceabilityData.recentActivities.slice(0, 10).map((activity) => (
                    <div key={activity.herbId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold">{activity.name} ({activity.herbId})</h4>
                          <p className="text-sm text-gray-600">
                            Farmer: {activity.collector?.name || 'N/A'} | 
                            Harvested: {formatDate(activity.harvestDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(activity.currentStatus)}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(activity.updatedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}