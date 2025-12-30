"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Beaker, 
  Plus, 
  Minus,
  Save,
  FileText,
  Leaf,
  Scale,
  Clock,
  Building
} from "lucide-react";

interface Herb {
  herbId: string;
  name: string;
  quantity: string;
  quality: string;
  currentStatus: string;
  harvestDate: string;
  collector: {
    name: string;
    farmerId: string;
  };
}

interface FormulationIngredient {
  herbId: string;
  herb?: Herb;
  quantityRequired: number;
  unit: string;
  purpose: string;
  processingMethod: string;
}

interface Formulation {
  formulationId?: string;
  name: string;
  type: 'medicine' | 'supplement' | 'cosmetic' | 'oil' | 'powder' | 'tablet';
  description: string;
  ingredients: FormulationIngredient[];
  processSteps: Array<{
    stepNumber: number;
    description: string;
    duration: string;
    temperature?: string;
    equipment: string;
  }>;
  qualityChecks: Array<{
    parameter: string;
    expectedValue: string;
    actualValue?: string;
    status?: 'pending' | 'pass' | 'fail';
  }>;
  manufacturer: {
    name: string;
    licenseNumber: string;
    address: string;
  };
  estimatedYield: string;
  productionDate: string;
  expiryDate: string;
  batchSize: number;
  status: 'draft' | 'in-production' | 'quality-testing' | 'completed' | 'rejected';
}

export default function Formulation() {
  const [formulation, setFormulation] = useState<Formulation>({
    name: '',
    type: 'medicine',
    description: '',
    ingredients: [],
    processSteps: [
      { stepNumber: 1, description: '', duration: '', equipment: '' }
    ],
    qualityChecks: [
      { parameter: 'pH Level', expectedValue: '', status: 'pending' },
      { parameter: 'Moisture Content', expectedValue: '', status: 'pending' },
      { parameter: 'Active Compound %', expectedValue: '', status: 'pending' }
    ],
    manufacturer: {
      name: '',
      licenseNumber: '',
      address: ''
    },
    estimatedYield: '',
    productionDate: '',
    expiryDate: '',
    batchSize: 1,
    status: 'draft'
  });

  const [availableHerbs, setAvailableHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableHerbs();
  }, []);

  const loadAvailableHerbs = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/herbs?status=Quality Tested&limit=100`
      );
      const result = await response.json();
      
      if (result.success) {
        setAvailableHerbs(result.data.herbs);
      }
    } catch (error) {
      console.error('Error loading herbs:', error);
    }
  };

  const addIngredient = () => {
    setFormulation(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        herbId: '',
        quantityRequired: 0,
        unit: 'grams',
        purpose: '',
        processingMethod: ''
      }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormulation(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: keyof FormulationIngredient, value: string | number) => {
    setFormulation(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { 
          ...ing, 
          [field]: value,
          ...(field === 'herbId' && value ? { 
            herb: availableHerbs.find(h => h.herbId === value) 
          } : {})
        } : ing
      )
    }));
  };

  const addProcessStep = () => {
    setFormulation(prev => ({
      ...prev,
      processSteps: [...prev.processSteps, {
        stepNumber: prev.processSteps.length + 1,
        description: '',
        duration: '',
        equipment: ''
      }]
    }));
  };

  const removeProcessStep = (index: number) => {
    setFormulation(prev => ({
      ...prev,
      processSteps: prev.processSteps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, stepNumber: i + 1 }))
    }));
  };

  const updateProcessStep = (index: number, field: string, value: string) => {
    setFormulation(prev => ({
      ...prev,
      processSteps: prev.processSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const updateQualityCheck = (index: number, field: string, value: string) => {
    setFormulation(prev => ({
      ...prev,
      qualityChecks: prev.qualityChecks.map((check, i) => 
        i === index ? { ...check, [field]: value } : check
      )
    }));
  };

  const addQualityCheck = () => {
    setFormulation(prev => ({
      ...prev,
      qualityChecks: [...prev.qualityChecks, {
        parameter: '',
        expectedValue: '',
        status: 'pending'
      }]
    }));
  };

  const removeQualityCheck = (index: number) => {
    setFormulation(prev => ({
      ...prev,
      qualityChecks: prev.qualityChecks.filter((_, i) => i !== index)
    }));
  };

  const validateFormulation = (): string[] => {
    const errors: string[] = [];
    
    if (!formulation.name.trim()) errors.push("Formulation name is required");
    if (!formulation.description.trim()) errors.push("Description is required");
    if (formulation.ingredients.length === 0) errors.push("At least one ingredient is required");
    if (!formulation.manufacturer.name.trim()) errors.push("Manufacturer name is required");
    if (!formulation.manufacturer.licenseNumber.trim()) errors.push("Manufacturer license number is required");
    if (!formulation.productionDate) errors.push("Production date is required");
    if (!formulation.expiryDate) errors.push("Expiry date is required");
    
    formulation.ingredients.forEach((ing, index) => {
      if (!ing.herbId) errors.push(`Ingredient ${index + 1}: Herb selection is required`);
      if (!ing.quantityRequired || ing.quantityRequired <= 0) {
        errors.push(`Ingredient ${index + 1}: Valid quantity is required`);
      }
      if (!ing.purpose.trim()) errors.push(`Ingredient ${index + 1}: Purpose is required`);
    });

    formulation.processSteps.forEach((step, index) => {
      if (!step.description.trim()) errors.push(`Step ${index + 1}: Description is required`);
      if (!step.duration.trim()) errors.push(`Step ${index + 1}: Duration is required`);
      if (!step.equipment.trim()) errors.push(`Step ${index + 1}: Equipment is required`);
    });

    return errors;
  };

  const saveFormulation = async () => {
    const errors = validateFormulation();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/formulations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formulation,
            formulationId: `FORM${Date.now()}`,
            createdAt: new Date().toISOString()
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success("Formulation saved successfully!");
        setFormulation(prev => ({ ...prev, status: 'in-production' }));
      } else {
        toast.error(result.error || "Failed to save formulation");
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save formulation");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'draft': 'secondary',
      'in-production': 'warning',
      'quality-testing': 'info',
      'completed': 'success',
      'rejected': 'destructive'
    } as const;
    
    return (
      <Badge variant={colors[status as keyof typeof colors] || "outline"}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Beaker className="h-8 w-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">Formulation Laboratory</h1>
              </div>
              <p className="text-gray-600">
                Create and manage Ayurvedic formulations with complete ingredient traceability.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(formulation.status)}
              <Button 
                onClick={saveFormulation} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Formulation"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formulationName">Formulation Name *</Label>
                  <Input
                    id="formulationName"
                    placeholder="e.g., Triphala Churna"
                    value={formulation.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormulation(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="formulationType">Type *</Label>
                  <Select 
                    value={formulation.type} 
                    onValueChange={(value: string) => setFormulation(prev => ({ ...prev, type: value as Formulation['type'] }))}
                  >
                    <SelectTrigger id="formulationType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                      <SelectItem value="cosmetic">Cosmetic</SelectItem>
                      <SelectItem value="oil">Oil</SelectItem>
                      <SelectItem value="powder">Powder</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the formulation, its uses, and benefits..."
                  value={formulation.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormulation(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    value={formulation.batchSize}
                    onChange={(e) => setFormulation(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedYield">Estimated Yield</Label>
                  <Input
                    id="estimatedYield"
                    placeholder="e.g., 5 kg"
                    value={formulation.estimatedYield}
                    onChange={(e) => setFormulation(prev => ({ ...prev, estimatedYield: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="productionDate">Production Date *</Label>
                  <Input
                    id="productionDate"
                    type="date"
                    value={formulation.productionDate}
                    onChange={(e) => setFormulation(prev => ({ ...prev, productionDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formulation.expiryDate}
                  onChange={(e) => setFormulation(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Ingredients ({formulation.ingredients.length})
                </span>
                <Button onClick={addIngredient} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formulation.ingredients.map((ingredient, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Ingredient {index + 1}</h4>
                    <Button 
                      onClick={() => removeIngredient(index)} 
                      variant="outline" 
                      size="sm"
                      className="text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Select Herb *</Label>
                      <Select 
                        value={ingredient.herbId} 
                        onValueChange={(value) => updateIngredient(index, 'herbId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose herb..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHerbs.map(herb => (
                            <SelectItem key={herb.herbId} value={herb.herbId}>
                              {herb.name} ({herb.herbId}) - Grade {herb.quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {ingredient.herb && (
                        <p className="text-sm text-gray-600 mt-1">
                          Available: {ingredient.herb.quantity} | 
                          Farmer: {ingredient.herb.collector?.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Quantity Required *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ingredient.quantityRequired}
                          onChange={(e) => updateIngredient(index, 'quantityRequired', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select 
                          value={ingredient.unit} 
                          onValueChange={(value) => updateIngredient(index, 'unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grams">Grams</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="ml">Milliliters</SelectItem>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Purpose *</Label>
                      <Input
                        placeholder="e.g., Primary active ingredient, flavoring agent..."
                        value={ingredient.purpose}
                        onChange={(e) => updateIngredient(index, 'purpose', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Processing Method</Label>
                      <Select 
                        value={ingredient.processingMethod} 
                        onValueChange={(value) => updateIngredient(index, 'processingMethod', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="powder">Powder</SelectItem>
                          <SelectItem value="extract">Extract</SelectItem>
                          <SelectItem value="whole">Whole</SelectItem>
                          <SelectItem value="oil">Oil extraction</SelectItem>
                          <SelectItem value="decoction">Decoction</SelectItem>
                          <SelectItem value="tincture">Tincture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
              
              {formulation.ingredients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No ingredients added yet. Click "Add Ingredient" to start.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Process Steps ({formulation.processSteps.length})
                </span>
                <Button onClick={addProcessStep} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formulation.processSteps.map((step, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Step {step.stepNumber}</h4>
                    {formulation.processSteps.length > 1 && (
                      <Button 
                        onClick={() => removeProcessStep(index)} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        placeholder="Describe this process step in detail..."
                        value={step.description}
                        onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Duration *</Label>
                        <Input
                          placeholder="e.g., 30 minutes"
                          value={step.duration}
                          onChange={(e) => updateProcessStep(index, 'duration', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Temperature</Label>
                        <Input
                          placeholder="e.g., 80°C"
                          value={step.temperature || ''}
                          onChange={(e) => updateProcessStep(index, 'temperature', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Equipment *</Label>
                        <Input
                          placeholder="e.g., Stainless steel pot"
                          value={step.equipment}
                          onChange={(e) => updateProcessStep(index, 'equipment', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Quality Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Quality Control Parameters ({formulation.qualityChecks.length})
                </span>
                <Button onClick={addQualityCheck} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formulation.qualityChecks.map((check, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Parameter</Label>
                      <Input
                        placeholder="e.g., pH Level, Moisture Content"
                        value={check.parameter}
                        onChange={(e) => updateQualityCheck(index, 'parameter', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Expected Value</Label>
                      <Input
                        placeholder="e.g., 6.5-7.0, <5%"
                        value={check.expectedValue}
                        onChange={(e) => updateQualityCheck(index, 'expectedValue', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={check.status || 'pending'} 
                        onValueChange={(value) => updateQualityCheck(index, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="pass">Pass</SelectItem>
                          <SelectItem value="fail">Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {formulation.qualityChecks.length > 3 && (
                    <Button 
                      onClick={() => removeQualityCheck(index)} 
                      variant="outline" 
                      size="sm"
                      className="text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Manufacturer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Manufacturer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Manufacturer Name *</Label>
                  <Input
                    id="manufacturerName"
                    placeholder="Company or individual name"
                    value={formulation.manufacturer.name}
                    onChange={(e) => setFormulation(prev => ({
                      ...prev,
                      manufacturer: { ...prev.manufacturer, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>License Number *</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="Manufacturing license number"
                    value={formulation.manufacturer.licenseNumber}
                    onChange={(e) => setFormulation(prev => ({
                      ...prev,
                      manufacturer: { ...prev.manufacturer, licenseNumber: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <Label>Address</Label>
                <Textarea
                  id="manufacturerAddress"
                  placeholder="Complete manufacturing facility address"
                  value={formulation.manufacturer.address}
                  onChange={(e) => setFormulation(prev => ({
                    ...prev,
                    manufacturer: { ...prev.manufacturer, address: e.target.value }
                  }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}