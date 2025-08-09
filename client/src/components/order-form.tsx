import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { User, Truck, Box, Send, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ModelViewer from "./model-viewer";
import { apiRequest } from "@/lib/queryClient";

const orderFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  deliveryMethod: z.enum(["delivery", "meetup"]),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  supportRemoval: z.boolean().default(false),
}).refine((data) => {
  if (data.deliveryMethod === "delivery") {
    return data.streetAddress && data.zipCode;
  }
  return true;
}, {
  message: "Address information is required for delivery",
  path: ["streetAddress"],
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface ModelAnalysis {
  weight: number;
  printTime: string;
  baseCost: number;
}

export default function OrderForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelAnalysis, setModelAnalysis] = useState<ModelAnalysis | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryMethod: "delivery",
      streetAddress: "",
      city: "Monroe Township",
      state: "NJ",
      zipCode: "",
      supportRemoval: false,
    },
  });

  const deliveryMethod = form.watch("deliveryMethod");
  const supportRemoval = form.watch("supportRemoval");

  // Mutation for analyzing 3D model
  const analyzeModelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('modelFile', file);
      const response = await apiRequest('POST', '/api/analyze-model', formData);
      return response.json();
    },
    onSuccess: (data: ModelAnalysis) => {
      setModelAnalysis(data);
      toast({
        title: "Model analyzed successfully",
        description: `Estimated weight: ${data.weight}g, Print time: ${data.printTime}`,
      });
    },
    onError: (error: any) => {
      console.error('File analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze 3D model",
        variant: "destructive",
      });
    },
  });

  // Mutation for submitting order
  const submitOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData & { modelFile?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'modelFile' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (data.modelFile) {
        formData.append('modelFile', data.modelFile);
      }
      const response = await apiRequest('POST', '/api/orders', formData);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order submitted successfully!",
        description: `Order ID: ${order.id}. We will contact you within 24 hours to confirm the details.`,
      });
      form.reset();
      setSelectedFile(null);
      setModelAnalysis(null);
    },
    onError: (error: any) => {
      toast({
        title: "Order submission failed",
        description: error.message || "Failed to submit order",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name, file.type, file.size);
    setSelectedFile(file);
    setModelAnalysis(null); // Clear previous analysis
    analyzeModelMutation.mutate(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const calculateTotalCost = () => {
    if (!modelAnalysis) return 0;
    const supportCost = supportRemoval ? 5.00 : 0;
    return modelAnalysis.baseCost + supportCost;
  };

  const onSubmit = (data: OrderFormData) => {
    if (!selectedFile || !modelAnalysis) {
      toast({
        title: "3D Model Required",
        description: "Please upload a 3D model file before submitting your order.",
        variant: "destructive",
      });
      return;
    }

    submitOrderMutation.mutate({
      ...data,
      modelFile: selectedFile,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Customer Information Section */}
        <section className="bg-dark-surface rounded-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <User className="mr-3 text-cyan-primary" />
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="Enter your full name"
                      className="bg-dark-bg border-dark-accent focus:border-cyan-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="bg-dark-bg border-dark-accent focus:border-cyan-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Delivery Options Section */}
        <section className="bg-dark-surface rounded-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Truck className="mr-3 text-cyan-primary" />
            Delivery Options
          </h2>
          <FormField
            control={form.control}
            name="deliveryMethod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    value={field.value}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="delivery" id="delivery" className="text-cyan-primary" />
                      <Label htmlFor="delivery" className="text-lg">
                        Delivery <span className="text-text-secondary text-sm">(Forsgate Community, Monroe Township only)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="meetup" id="meetup" className="text-cyan-primary" />
                      <Label htmlFor="meetup" className="text-lg">Meetup Location</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address Section */}
          {deliveryMethod === "delivery" && (
            <div className="mt-6 p-4 bg-dark-bg rounded-lg">
              <h3 className="text-lg font-medium mb-4">Delivery Address</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="123 Main Street"
                          className="bg-dark-surface border-dark-accent focus:border-cyan-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input 
                      value="Monroe Township"
                      readOnly
                      className="bg-dark-accent border-dark-accent text-text-secondary cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input 
                      value="NJ"
                      readOnly
                      className="bg-dark-accent border-dark-accent text-text-secondary cursor-not-allowed"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="08831"
                            className="bg-dark-surface border-dark-accent focus:border-cyan-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Meetup Message */}
          {deliveryMethod === "meetup" && (
            <div className="mt-6 p-4 bg-cyan-dark/10 border border-cyan-dark rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="text-cyan-primary mr-3 h-5 w-5" />
                <p className="text-cyan-primary font-medium">An agent will contact you soon to arrange the meetup location.</p>
              </div>
            </div>
          )}
        </section>

        {/* 3D Model Upload & Price Calculator Section */}
        <section className="bg-dark-surface rounded-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Box className="mr-3 text-cyan-primary" />
            3D Model & Pricing
          </h2>
          
          {/* File Upload Area */}
          <div className="mb-6">
            <Label className="block text-sm font-medium mb-2">Upload 3D Model File *</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer bg-dark-bg transition-colors file-upload-area ${
                isDragOver ? 'border-cyan-primary bg-cyan-primary/10' : 'border-dark-accent hover:border-cyan-primary'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <>
                  <CheckCircle2 className="text-4xl text-cyan-primary mb-4 mx-auto" />
                  <p className="text-lg mb-2 text-cyan-primary">File uploaded: {selectedFile.name}</p>
                  <p className="text-sm text-text-secondary">Click to select a different file</p>
                </>
              ) : (
                <>
                  <Upload className="text-4xl text-text-secondary mb-4 mx-auto" />
                  <p className="text-lg mb-2">Drop your 3D model file here or <span className="text-cyan-primary">click to browse</span></p>
                  <p className="text-sm text-text-secondary">Supported formats: STL, OBJ, 3MF (Max 50MB)</p>
                </>
              )}
              <input 
                id="file-input"
                type="file" 
                accept=".stl,.obj,.3mf" 
                onChange={handleFileUpload}
                className="hidden" 
              />
            </div>
          </div>

          {/* Model Preview & Price Calculator */}
          {selectedFile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-dark-bg rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Model Preview</h3>
                <ModelViewer file={selectedFile} />
              </div>
              
              {modelAnalysis && (
                <div className="bg-dark-bg rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Price Calculation</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Model Weight:</span>
                      <span className="font-semibold">{modelAnalysis.weight}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Print Time:</span>
                      <span className="font-semibold">{modelAnalysis.printTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Base Cost ($0.25/gram):</span>
                      <span className="font-semibold">${modelAnalysis.baseCost.toFixed(2)}</span>
                    </div>
                    
                    {/* Support Removal Option */}
                    <div className="border-t border-dark-accent pt-4">
                      <FormField
                        control={form.control}
                        name="supportRemoval"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="text-cyan-primary border-dark-accent"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Add Support Removal (+$5.00)</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="border-t border-dark-accent pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Cost:</span>
                        <span className="text-cyan-primary">${calculateTotalCost().toFixed(2)}</span>
                      </div>
                      
                      {/* Price Disclaimer */}
                      <div className="mt-3 p-3 bg-dark-accent rounded-lg">
                        <p className="text-sm text-text-secondary">
                          <span className="text-yellow-400">⚠️ Note:</span> The price calculator sometimes malfunctions and may give incorrect pricing estimates. Final pricing will be confirmed before production begins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {analyzeModelMutation.isPending && (
                <div className="bg-dark-bg rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Analyzing Model...</h3>
                  <div className="flex items-center justify-center py-8">
                    <Box className="h-8 w-8 text-cyan-primary animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Submit Section */}
        <section className="bg-dark-surface rounded-xl p-6 shadow-2xl">
          <Button 
            type="submit" 
            className="w-full bg-cyan-primary hover:bg-cyan-dark text-dark-bg font-bold py-4 px-8 text-lg"
            disabled={submitOrderMutation.isPending || !selectedFile || !modelAnalysis}
          >
            {submitOrderMutation.isPending ? (
              <>
                <Box className="mr-3 h-5 w-5 animate-spin" />
                Submitting Order...
              </>
            ) : (
              <>
                <Send className="mr-3 h-5 w-5" />
                Submit Order
              </>
            )}
          </Button>
          
          <p className="text-sm text-text-secondary text-center mt-4">
            By placing this order, you agree to our{' '}
            <a 
              href="https://tally.so/r/3y5RQd" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-primary hover:text-cyan-dark transition-colors"
            >
              Terms of Service
            </a>
          </p>
        </section>
      </form>
    </Form>
  );
}
