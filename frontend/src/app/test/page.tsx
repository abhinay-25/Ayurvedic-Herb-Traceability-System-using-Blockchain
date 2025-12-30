"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function TestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [herbId, setHerbId] = useState("HRB001");

  const createTestData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/herbs/test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Test herb created successfully!");
        setTestResults(result);
      } else {
        toast.error(result.error || "Failed to create test data");
      }
    } catch (error) {
      toast.error("Failed to create test data: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testHerbHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/herbs/${herbId}/history`);
      const result = await response.json();
      
      if (result.success) {
        toast.success("Herb history fetched successfully!");
        setTestResults(result);
      } else {
        toast.error(result.error || "Failed to fetch herb history");
      }
    } catch (error) {
      toast.error("Failed to fetch herb history: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/health');
      const result = await response.json();
      
      if (result.success) {
        toast.success("API health check passed!");
        setTestResults(result);
      } else {
        toast.error("API health check failed");
      }
    } catch (error) {
      toast.error("API is not accessible: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Herb Traceability Test Center
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Controls */}
            <Card>
              <CardHeader>
                <CardTitle>API Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Herb ID for Testing:</label>
                  <Input
                    value={herbId}
                    onChange={(e) => setHerbId(e.target.value)}
                    placeholder="Enter herb ID (e.g., HRB001)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={testHealthCheck}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Testing..." : "Test API Health"}
                  </Button>
                  
                  <Button 
                    onClick={createTestData}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? "Creating..." : "Create Test Herb Data"}
                  </Button>
                  
                  <Button 
                    onClick={testHerbHistory}
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                  >
                    {loading ? "Fetching..." : "Test Herb History API"}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button asChild className="w-full">
                    <Link href={`/herbs/${herbId}`}>
                      View Herb Journey Page
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h4 className="font-medium text-green-800">✅ Success</h4>
                      <p className="text-sm text-green-600 mt-1">
                        API responded successfully
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 max-h-96 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {JSON.stringify(testResults, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🔬</div>
                    <p>Run a test to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" asChild>
                  <Link href="/herbs">All Herbs</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/add-herb">Add New Herb</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/herbs/HRB001">Test Journey</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="http://localhost:8080/health" target="_blank">
                    API Health
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>🎯 Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Test API Health</h4>
                <p className="text-sm text-gray-600">
                  Verify that the backend API is running and accessible
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">2. Create Test Data</h4>
                <p className="text-sm text-gray-600">
                  Generate sample herb data (Ashwagandha) for testing the journey visualization
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">3. Test History API</h4>
                <p className="text-sm text-gray-600">
                  Fetch the complete traceability journey for the test herb
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">4. View Journey Page</h4>
                <p className="text-sm text-gray-600">
                  Navigate to the complete herb details page with timeline visualization
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}