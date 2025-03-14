import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { medicalRecordsApi } from "@/lib/api";

interface MedicalRecord {
  id: string;
  type: string;
  description: string;
  fileName: string;
}

interface UpdateRecordFormProps {
  record: MedicalRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateRecordForm({ record, isOpen, onClose, onSuccess }: UpdateRecordFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    type: record.type,
    description: record.description || "",
    changeReason: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'image/tiff',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid document or image file.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.changeReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for the change.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const updateFormData = new FormData();
      
      if (file) {
        updateFormData.append("file", file);
      }
      
      updateFormData.append("type", formData.type);
      updateFormData.append("description", formData.description);
      updateFormData.append("changeReason", formData.changeReason);

      await medicalRecordsApi.updateRecord(record.id, updateFormData);
      
      toast({
        title: "Record Updated",
        description: "The medical record has been updated successfully.",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating medical record:", error);
      toast({
        title: "Error",
        description: "Failed to update the medical record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Medical Record</DialogTitle>
          <DialogDescription>
            Make changes to the medical record. This will create a new version.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-file">Current File</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
              {record.fileName}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file">Replace File (Optional)</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type">Record Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="lab_report">Lab Results</SelectItem>
                <SelectItem value="medical_history">Medical History</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter a description for this record"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="changeReason" className="text-primary">Reason for Change*</Label>
            <Textarea
              id="changeReason"
              value={formData.changeReason}
              onChange={(e) => handleInputChange("changeReason", e.target.value)}
              placeholder="Explain why you're updating this record"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be stored in the version history.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
