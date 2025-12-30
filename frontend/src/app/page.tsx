"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { 
  Leaf, 
  Shield, 
  Activity, 
  Users, 
  TrendingUp, 
  QrCode,
  MapPin,
  CheckCircle,
  Loader2
} from "lucide-react";

interface Herb {
  _id: string;
  herbId: string;
  name: string;
  collector: string;
  harvestDate: string;
  status: string;
  geoTag: {
    latitude: number;
    longitude: number;
    location?: string;
  };
  quantity: number;
  unit: string;
  quality: string;
  blockchainTx?: string;
}

export default function Home() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch herbs from API
  useEffect(() => {
    const fetchHerbs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/herbs`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setHerbs(data.data);
        } else {
          setHerbs([]);
        }
      } catch (err) {
        console.error('Error fetching herbs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch herbs');
      } finally {
        setLoading(false);
      }
    };

    fetchHerbs();
  }, []);

  // Calculate stats from real data
  const stats = [
    { label: "Total Herbs Tracked", value: herbs.length.toString(), icon: Leaf, color: "text-green-600" },
    { label: "Verified Farmers", value: new Set(herbs.map(h => h.collector)).size.toString(), icon: Users, color: "text-blue-600" },
    { label: "Blockchain Transactions", value: herbs.filter(h => h.blockchainTx).length.toString(), icon: Activity, color: "text-purple-600" },
    { label: "Quality Verified", value: herbs.length > 0 ? `${Math.round((herbs.filter(h => h.quality === 'A').length / herbs.length) * 100)}%` : "0%", icon: Shield, color: "text-emerald-600" },
  ];

  const recentHerbs = herbs.slice(0, 5); // Show latest 5 herbs

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "Collected": "secondary",
      "In Processing": "info", 
      "Quality Tested": "success",
      "Processed": "info",
      "Shipped": "warning",
      "Delivered": "default"
    } as const;
    
    return <Badge variant={statusColors[status as keyof typeof statusColors] || "outline"}>{status}</Badge>;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-8 text-white mb-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">
            Ayurvedic Herb Traceability System
          </h1>
          <p className="text-xl mb-6 text-green-100">
            Blockchain-powered transparency for Ayurvedic herbs from farm to pharmacy. 
            Built on Avalanche Fuji testnet for secure, immutable traceability.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/add-herb">
                <Leaf className="mr-2 h-5 w-5" />
                Add New Herb
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600" asChild>
              <Link href="/scan">
                <QrCode className="mr-2 h-5 w-5" />
                Scan QR Code
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Herbs Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Recent Herb Entries
          </CardTitle>
          <CardDescription>
            Latest herbs added to the traceability system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Herb ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Scientific Name</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Harvest Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading herbs...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-red-600">
                    Error loading herbs: {error}
                  </TableCell>
                </TableRow>
              ) : recentHerbs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No herbs found. <Link href="/add-herb" className="text-green-600 hover:underline">Add the first herb</Link>
                  </TableCell>
                </TableRow>
              ) : (
                recentHerbs.map((herb) => (
                  <TableRow key={herb._id}>
                    <TableCell className="font-medium">{herb.herbId}</TableCell>
                    <TableCell>{herb.name}</TableCell>
                    <TableCell className="text-muted-foreground italic">-</TableCell>
                    <TableCell>{herb.collector}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                        {herb.geoTag?.location || `${herb.geoTag?.latitude}, ${herb.geoTag?.longitude}`}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(herb.status)}</TableCell>
                    <TableCell>{new Date(herb.harvestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/herb/${herb.herbId}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-600" />
              Blockchain Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Every transaction is recorded on Avalanche Fuji testnet, ensuring immutable 
              and transparent traceability records.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              Quality Assurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Complete tracking from harvest to delivery ensures authentic Ayurvedic herbs 
              with verified quality standards.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-purple-600" />
              Geo-tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              GPS coordinates and location mapping provide complete visibility into 
              the herb's journey across the supply chain.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}