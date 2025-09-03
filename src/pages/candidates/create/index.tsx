import { Icon } from "@/components/icon";
import { useCandidates } from "@/hooks/useCandidates";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "@/routes/hooks";
import { toast } from "sonner";

interface CandidateFormData {
  name: string;
  description: string;
  image?: File;
}

export default function CreateCandidate() {
  const router = useRouter();
  const params = useParams();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { candidates, createCandidate, updateCandidate, isCreating, isUpdating } = useCandidates();
  
  const candidateId = params.id;
  const isEditing = !!candidateId;
  const currentCandidate = isEditing ? candidates.find(c => c.id === candidateId) : null;
  
  const form = useForm<CandidateFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (currentCandidate) {
      form.reset({
        name: currentCandidate.name || "",
        description: currentCandidate.description || "",
      });
      if (currentCandidate.image_url) {
        setImagePreview(currentCandidate.image_url);
      }
    }
  }, [currentCandidate, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Set preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Update form
      form.setValue('image', file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue('image', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (data: CandidateFormData) => {
    try {
      if (isEditing) {
        await updateCandidate({ id: candidateId, ...data });
        toast.success("Candidate updated successfully!");
      } else {
        await createCandidate(data);
        toast.success("Candidate added successfully!");
      }
      router.push("/candidates");
    } catch (error) {
      toast.error(isEditing ? "Failed to update candidate" : "Failed to add candidate");
    }
  };

  const handleBack = () => {
    router.push("/candidates");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <Icon icon="solar:arrow-left-outline" className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
      </div>

      <h1 className="text-3xl font-bold">{isEditing ? "Edit Candidate" : "Add New Candidate"}</h1>

      {/* Form Card */}
      <Card className="max-w-2xl mx-auto relative">
        {/* Loading Overlay */}
        {(isCreating || isUpdating) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <Icon icon="solar:refresh-outline" className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">{isEditing ? "Updating candidate..." : "Adding candidate..."}</p>
            </div>
          </div>
        )}

        
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Image Upload */}
              <div className="space-y-4">
                <FormLabel>Candidate Photo</FormLabel>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
                        onClick={handleRemoveImage}
                        disabled={isCreating || isUpdating}
                      >
                        <Icon icon="solar:close-circle-outline" className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Icon icon="solar:camera-outline" className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCreating}
                    >
                      <Icon icon="solar:upload-outline" className="w-4 h-4 mr-2" />
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveImage}
                        disabled={isCreating || isUpdating}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <FormDescription>
                    Upload a photo of the candidate (max 5MB, JPG/PNG)
                  </FormDescription>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Candidate name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Ahmed Hassan"
                          disabled={isCreating || isUpdating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the candidate's platform and qualifications..."
                          className="min-h-[120px]"
                          disabled={isCreating || isUpdating}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be shown to voters during elections
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Icon icon="solar:refresh-outline" className="w-4 h-4 mr-2 animate-spin" />}
                  {(isCreating || isUpdating) 
                    ? (isEditing ? "Updating..." : "Adding...") 
                    : (isEditing ? "Update Candidate" : "Add Candidate")
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}