import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { useForm } from "react-hook-form";
  import { Reward } from "../types";
  import { Switch } from "@/components/ui/switch";
  import { useState, useRef, useEffect } from "react";
  import { Upload, Trash2 } from "lucide-react";
  import { toast } from "sonner";
  
  interface RewardFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reward: Reward | null;
    onCreate: (reward: Omit<Reward, 'id' | 'created_at'>) => Promise<void>;
    onUpdate: (id: string, updates: Partial<Reward>) => Promise<void>;
    onUploadImage: (file: File) => Promise<string>;
    onDeleteImage: (url: string) => Promise<void>;
  }
  
  export function RewardForm({ 
    open, 
    onOpenChange, 
    reward, 
    onCreate, 
    onUpdate,
    onUploadImage,
    onDeleteImage
  }: RewardFormProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(reward?.image_url || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const { register, handleSubmit, reset, setValue } = useForm<Reward>({
      defaultValues: reward || {
        name: "",
        description: "",
        points_required: 0,
        is_active: true,
        image_url: null,
      },
    });
  
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      setIsUploading(true);
      try {
        // Remove old image if exists
        if (previewImage) {
          await onDeleteImage(previewImage);
        }
  
        const imageUrl = await onUploadImage(file);
        setValue("image_url", imageUrl);
        setPreviewImage(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    };
  
    const removeImage = async () => {
      if (previewImage) {
        await onDeleteImage(previewImage);
      }
      setPreviewImage(null);
      setValue("image_url", null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  
    const onSubmit = async (data: Reward) => {
        const toastId = toast.loading(reward ? 'Updating reward...' : 'Creating reward...');
        
        try {
          if (reward) {
            await onUpdate(reward.id, data);
            toast.success('Updated successfully', { id: toastId });
          } else {
            await onCreate(data);
            toast.success('Created successfully', { id: toastId });
          }
          onOpenChange(false);
        } catch (error) {
          console.error("Error saving reward:", error);
          toast.error('Operation failed', { id: toastId });
        }
      };
  
    useEffect(() => {
      reset(reward || {
        name: "",
        description: "",
        points_required: 0,
        is_active: true,
        image_url: null,
      });
      setPreviewImage(reward?.image_url || null);
    }, [reward, open, reset]);
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reward ? "Edit Reward" : "Add New Reward"}</DialogTitle>
            <DialogDescription>
              {reward ? "Update reward details" : "Create a new reward for redemption"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Reward Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="Enter reward name"
              />
            </div>
  
            <div className="space-y-2">
              <Label>Reward Image</Label>
              {previewImage ? (
                <div className="relative group">
                  <img
                    src={previewImage}
                    alt="Reward preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeImage}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
              {isUploading && <p className="text-sm text-muted-foreground">Uploading image...</p>}
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Enter reward description"
              />
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="points_required">Points Required</Label>
              <Input
                id="points_required"
                type="number"
                {...register("points_required", { required: true, valueAsNumber: true })}
                placeholder="Enter points required"
              />
            </div>
  
            <div className="flex items-center space-x-2">
              <Switch id="is_active" {...register("is_active")} />
              <Label htmlFor="is_active">Active</Label>
            </div>
  
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                Save Reward
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }