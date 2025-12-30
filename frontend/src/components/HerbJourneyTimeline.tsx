"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  User, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check
} from "lucide-react";
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

interface HerbJourneyTimelineProps {
  journey: HerbJourneyStep[];
}

export function HerbJourneyTimeline({ journey }: HerbJourneyTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null);

  const toggleStepExpansion = (stepId: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const copyTxHash = async (txHash: string) => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopiedTxHash(txHash);
      toast.success("Transaction hash copied to clipboard!");
      setTimeout(() => setCopiedTxHash(null), 2000);
    } catch (error) {
      toast.error("Failed to copy transaction hash");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getColorClasses = (color: string, isCurrentStep: boolean, isCompleted: boolean) => {
    const baseColors = {
      green: isCurrentStep ? 'bg-green-500 border-green-600' : isCompleted ? 'bg-green-400 border-green-500' : 'bg-green-100 border-green-300',
      blue: isCurrentStep ? 'bg-blue-500 border-blue-600' : isCompleted ? 'bg-blue-400 border-blue-500' : 'bg-blue-100 border-blue-300',
      orange: isCurrentStep ? 'bg-orange-500 border-orange-600' : isCompleted ? 'bg-orange-400 border-orange-500' : 'bg-orange-100 border-orange-300',
      purple: isCurrentStep ? 'bg-purple-500 border-purple-600' : isCompleted ? 'bg-purple-400 border-purple-500' : 'bg-purple-100 border-purple-300',
      yellow: isCurrentStep ? 'bg-yellow-500 border-yellow-600' : isCompleted ? 'bg-yellow-400 border-yellow-500' : 'bg-yellow-100 border-yellow-300',
      gray: isCurrentStep ? 'bg-gray-500 border-gray-600' : isCompleted ? 'bg-gray-400 border-gray-500' : 'bg-gray-100 border-gray-300',
    };
    return baseColors[color as keyof typeof baseColors] || baseColors.gray;
  };

  const getTextColorClasses = (color: string, isCurrentStep: boolean, isCompleted: boolean) => {
    if (isCurrentStep || isCompleted) {
      return 'text-white';
    }
    const textColors = {
      green: 'text-green-700',
      blue: 'text-blue-700',
      orange: 'text-orange-700',
      purple: 'text-purple-700',
      yellow: 'text-yellow-700',
      gray: 'text-gray-700',
    };
    return textColors[color as keyof typeof textColors] || textColors.gray;
  };

  const openGeoTag = (geoTag: { latitude: number; longitude: number; address: string }) => {
    if (geoTag && geoTag.latitude && geoTag.longitude) {
      const url = `https://www.google.com/maps?q=${geoTag.latitude},${geoTag.longitude}`;
      window.open(url, '_blank');
    } else {
      toast.error("Invalid geo-tag format");
    }
  };

  const openBlockchainExplorer = (txHash: string) => {
    if (txHash) {
      const url = `https://testnet.snowtrace.io/tx/${txHash}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("No transaction hash available");
    }
  };

  if (!journey || journey.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Journey Data</h3>
        <p className="text-gray-600">No traceability data is available for this herb yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Journey Progress</span>
          <span className="text-sm text-gray-500">
            {journey.filter(step => step.isCompleted).length} of {journey.length} steps completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${(journey.filter(step => step.isCompleted).length / journey.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {journey.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id);
          const dateTime = formatDate(step.timestamp);
          
          return (
            <div key={step.id} className="relative pb-8 last:pb-0">
              {/* Timeline Dot */}
              <div className={`
                absolute left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10
                ${getColorClasses(step.stage.color, step.isCurrentStep, step.isCompleted)}
                ${getTextColorClasses(step.stage.color, step.isCurrentStep, step.isCompleted)}
              `}>
                {step.isCurrentStep ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ) : step.isCompleted ? (
                  '✓'
                ) : (
                  step.stepNumber
                )}
              </div>

              {/* Content Card */}
              <div className="ml-12">
                <Card className={`
                  transition-all duration-200 hover:shadow-md cursor-pointer
                  ${step.isCurrentStep ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                  ${step.isCompleted ? 'border-green-200' : ''}
                `}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div 
                      className="flex items-center justify-between"
                      onClick={() => toggleStepExpansion(step.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{step.stage.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {step.stage.name}
                            {step.isCurrentStep && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{step.stage.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {step.status}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dateTime.date} at {dateTime.time}
                      </div>
                      {step.geoTag && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGeoTag(step.geoTag);
                          }}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <MapPin className="h-3 w-3" />
                          {step.geoTag.address || `${step.geoTag.latitude}, ${step.geoTag.longitude}`}
                        </button>
                      )}
                      {step.updatedBy && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {step.updatedBy}
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {step.description && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                              Description
                            </label>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          </div>
                        )}

                        {step.location && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                              Location
                            </label>
                            <p className="text-sm text-gray-600 mt-1">{step.location}</p>
                          </div>
                        )}

                        {step.txHash && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                              Blockchain Transaction
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                {step.txHash.slice(0, 10)}...{step.txHash.slice(-10)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  copyTxHash(step.txHash);
                                }}
                              >
                                {copiedTxHash === step.txHash ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  openBlockchainExplorer(step.txHash);
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          {step.geoTag && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                openGeoTag(step.geoTag);
                              }}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              View Location
                            </Button>
                          )}
                          {step.txHash && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                openBlockchainExplorer(step.txHash);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View on Blockchain
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-lg">🎯</span>
            <span className="font-medium text-green-800">Journey Complete</span>
          </div>
          <Badge className="bg-green-600 text-white">
            {journey.length} Step{journey.length !== 1 ? 's' : ''} Tracked
          </Badge>
        </div>
        <p className="text-sm text-green-700 mt-2">
          This herb's complete journey has been tracked and verified on the blockchain, 
          ensuring full transparency and authenticity.
        </p>
      </div>
    </div>
  );
}