"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GeoTagMap, farmIcon } from '@/components/maps';
import { usePublicClient } from 'wagmi';
import { contractConfig } from '@/lib/wagmi';
import { 
  MapPin, 
  Calendar, 
  User, 
  Leaf, 
  Package, 
  Clock,
  ExternalLink,
  Eye
} from 'lucide-react';

interface HerbData {
  herbId: string;
  name: string;
  scientificName?: string;
  collector: string;
  farmerName?: string;
  farmerContact?: string;
  geoTag: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  harvestDate: string;
  status: string;
  quantity: number;
  unit: string;
  quality?: string;
  variety?: string;
  description?: string;
  origin?: string;
  blockchainTx?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    updatedBy?: string;
    location?: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// TraceabilityTimeline Component
function TraceabilityTimeline({ statusHistory }: { statusHistory: Array<{
  status: string;
  timestamp: string;
  updatedBy?: string;
  location?: string;
  notes?: string;
}> }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traceability Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No traceability history available.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by timestamp to show chronological order
  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'collected': return 'bg-green-100 text-green-800 border-green-200';
      case 'in processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packaged': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'final formulation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'distributed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Traceability Journey</CardTitle>
        <p className="text-sm text-gray-600">From step 1 to current status - Every detail of the herb's journey</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {sortedHistory.map((entry, index) => (
            <div key={index} className="relative flex items-start mb-8 last:mb-0">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 bg-white ${
                index === sortedHistory.length - 1 ? 'border-green-500' : 'border-gray-300'
              }`}>
                <div className={`w-4 h-4 rounded-full ${
                  index === sortedHistory.length - 1 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              
              {/* Timeline content */}
              <div className="ml-6 flex-1">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getStatusColor(entry.status)} border`}>
                      Step {index + 1}: {entry.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {entry.updatedBy && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Updated by:</strong> {entry.updatedBy}
                    </p>
                  )}
                  
                  {entry.location && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Location:</strong> {entry.location}
                    </p>
                  )}
                  
                  {entry.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                      <strong>Notes:</strong> {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HerbDetailsPage() {
  const params = useParams();
  const herbId = params.id as string;
  const [herb, setHerb] = useState<HerbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();
  const [onChainVerified, setOnChainVerified] = useState(false);
  const [onChainTxHash, setOnChainTxHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchHerb = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/herbs/${herbId}`);
        if (!response.ok) {
          throw new Error('Herb not found');
        }
        const data = await response.json();
        setHerb(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (herbId) {
      fetchHerb();
    }
  }, [herbId]);

  // Probe on-chain existence and try to fetch a recent tx hash for this herbId
  useEffect(() => {
    if (!herbId || !publicClient) return;

    (async () => {
      try {
        // If this read succeeds, herb exists on-chain
        // @ts-ignore - Wagmi/Viem types can be verbose; params are valid
        const latest = await publicClient.readContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'getLatestStatus',
          args: [herbId],
        });

        if (latest) {
          setOnChainVerified(true);

          // Attempt to get the most recent tx hash via logs (StatusUpdated or HerbAdded)
          try {
            const current = await publicClient.getBlockNumber();
            const lookback: bigint = 500000n; // ~recent window; adjust as needed
            const fromBlock = current > lookback ? current - lookback : 0n;

            const abiArray = contractConfig.abi as unknown as any[];
            const statusUpdatedEvent = abiArray.find((x) => x.type === 'event' && x.name === 'StatusUpdated');
            const herbAddedEvent = abiArray.find((x) => x.type === 'event' && x.name === 'HerbAdded');

            // @ts-ignore - viem getLogs with event + args
            const logs1 = await publicClient.getLogs({
              address: contractConfig.address,
              event: statusUpdatedEvent,
              args: { herbId },
              fromBlock,
            });

            // @ts-ignore
            const logs2 = (!logs1 || logs1.length === 0) ? await publicClient.getLogs({
              address: contractConfig.address,
              event: herbAddedEvent,
              args: { herbId },
              fromBlock,
            }) : [];

            // Pick the most recent relevant log
            const latestLog = (logs1 && logs1.length > 0)
              ? logs1[logs1.length - 1]
              : ((logs2 && logs2.length > 0) ? logs2[logs2.length - 1] : null);

            // viem log objects expose transactionHash
            // @ts-ignore
            if (latestLog && latestLog.transactionHash) {
              // @ts-ignore
              setOnChainTxHash(latestLog.transactionHash as `0x${string}`);
            }
          } catch {
            // Non-critical: we can still show Verified without a specific hash
          }
        }
      } catch {
        setOnChainVerified(false);
      }
    })();
  }, [herbId, publicClient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Collected':
        return 'bg-green-500';
      case 'In Processing':
        return 'bg-blue-500';
      case 'Packaged':
        return 'bg-purple-500';
      case 'Final Formulation':
        return 'bg-orange-500';
      case 'Distributed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !herb) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-red-500 text-xl mb-4">Error</div>
              <p>{error || 'Herb not found'}</p>
              <Button 
                onClick={() => window.history.back()} 
                variant="outline" 
                className="mt-4"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const mapMarkers = [
    {
      position: [herb.geoTag.latitude, herb.geoTag.longitude] as [number, number],
      popup: `
        <div class="p-2">
          <strong>${herb.name}</strong><br/>
          Collected by: ${herb.collector}<br/>
          Date: ${new Date(herb.harvestDate).toLocaleDateString()}<br/>
          Status: ${herb.status}
        </div>
      `,
      icon: farmIcon,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Herb Details</h1>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(herb.status)} text-white`}
            >
              {herb.status}
            </Badge>
          </div>
          <p className="text-gray-600">Detailed information about herb #{herb.herbId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-green-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Herb ID:</span>
                  <p className="font-mono">{herb.herbId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p>{herb.name}</p>
                </div>
                {herb.scientificName && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">Scientific Name:</span>
                    <p className="italic">{herb.scientificName}</p>
                  </div>
                )}
                {herb.variety && (
                  <div>
                    <span className="font-medium text-gray-600">Variety:</span>
                    <p>{herb.variety}</p>
                  </div>
                )}
                {herb.origin && (
                  <div>
                    <span className="font-medium text-gray-600">Origin:</span>
                    <p>{herb.origin}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-600">Quantity:</span>
                  <p>{herb.quantity} {herb.unit}</p>
                </div>
                {herb.quality && (
                  <div>
                    <span className="font-medium text-gray-600">Quality Grade:</span>
                    <p>{herb.quality}</p>
                  </div>
                )}
              </div>
              {herb.description && (
                <div>
                  <span className="font-medium text-gray-600 block mb-2">Description:</span>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{herb.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collection Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Collection Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Collector:</span>
                  <p>{herb.collector}</p>
                </div>
                {herb.farmerName && herb.farmerName !== herb.collector && (
                  <div>
                    <span className="font-medium text-gray-600">Farmer:</span>
                    <p>{herb.farmerName}</p>
                  </div>
                )}
                {herb.farmerContact && (
                  <div>
                    <span className="font-medium text-gray-600">Contact:</span>
                    <p>{herb.farmerContact}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-600">Harvest Date:</span>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(herb.harvestDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Collection Coordinates:</span>
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {herb.geoTag.latitude.toFixed(6)}, {herb.geoTag.longitude.toFixed(6)}
                  </p>
                </div>
                {herb.geoTag.address && (
                  <div>
                    <span className="font-medium text-gray-600">Location:</span>
                    <p>{herb.geoTag.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-purple-600" />
                Collection Location
              </CardTitle>
              <CardDescription>
                Interactive map showing where this herb was collected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeoTagMap
                center={[herb.geoTag.latitude, herb.geoTag.longitude]}
                zoom={15}
                markers={mapMarkers}
                height="400px"
                interactive={false}
                className="rounded-md overflow-hidden border"
              />
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-600" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Created:</span>
                  <p>{new Date(herb.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <p>{new Date(herb.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Status:</span>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(herb.status)} text-white`}
                  >
                    {herb.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-indigo-600" />
                Blockchain Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(herb.blockchainTx || onChainVerified) ? (
                <div>
                  {(herb.blockchainTx || onChainTxHash) ? (
                    <>
                      <span className="font-medium text-gray-600 block mb-2">Transaction Hash:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono flex-1 truncate">
                          {herb.blockchainTx || onChainTxHash}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://testnet.snowtrace.io/tx/${herb.blockchainTx || onChainTxHash}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                        ✓ Verified on Blockchain
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Verified on Blockchain
                      </Badge>
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://testnet.snowtrace.io/address/${contractConfig.address}`, '_blank')}
                        >
                          View Contract on SnowTrace
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    ⚠ Not recorded on blockchain
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    This herb exists only in the database
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Complete Traceability Journey Timeline */}
        <div className="mt-8">
          <TraceabilityTimeline statusHistory={herb.statusHistory || []} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button 
            onClick={() => window.location.href = '/update-status'}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Layout>
  );
}