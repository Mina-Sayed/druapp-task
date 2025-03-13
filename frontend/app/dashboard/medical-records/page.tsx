"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Lock, Upload, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { medicalRecordsApi } from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

// Define the MedicalRecord type based on the backend entity
interface MedicalRecord {
  id: string;
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    name: string;
  };
  type: string;
  fileName: string;
  fileKey: string;
  mimeType: string;
  description: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define pagination metadata interface
interface PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export default function MedicalRecordsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState({
    type: "prescription",
    description: "",
    patientId: "", // Only needed for doctors
  })
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    totalItems: 0,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  })

  // Fetch medical records on component mount or when page changes
  useEffect(() => {
    if (user) {
      fetchMedicalRecords(paginationMeta.currentPage, paginationMeta.itemsPerPage)
    }
  }, [user, paginationMeta.currentPage])

  const fetchMedicalRecords = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true)
      const response = await medicalRecordsApi.getAll(page, limit)
      setRecords(response.items)
      setPaginationMeta(response.meta)
    } catch (error) {
      console.error("Error fetching medical records:", error)
      toast({
        title: "Error",
        description: "Failed to fetch medical records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", uploadData.type)
      formData.append("description", uploadData.description)
      
      // If user is a doctor, include the patient ID
      if (user?.role === "doctor" && uploadData.patientId) {
        formData.append("patientId", uploadData.patientId)
      }

      await medicalRecordsApi.uploadRecord(formData)
      
      // Refresh the records list
      await fetchMedicalRecords()

    toast({
      title: "Record Uploaded",
      description: "The medical record has been uploaded successfully.",
    })

      // Reset form and close dialog
    setIsUploadDialogOpen(false)
      setFile(null)
      setUploadData({
        type: "prescription",
        description: "",
        patientId: "",
      })
    } catch (error) {
      console.error("Error uploading medical record:", error)
      toast({
        title: "Error",
        description: "Failed to upload medical record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRecord = async (id: string) => {
    try {
      setIsLoading(true)
      const record = await medicalRecordsApi.getRecord(id)
      setSelectedRecord(record)
    } catch (error) {
      console.error("Error fetching record details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch record details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      setIsLoading(true)
      await medicalRecordsApi.deleteRecord(id)
      
      // Refresh the records list
      await fetchMedicalRecords()

      toast({
        title: "Record Deleted",
        description: "The medical record has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting medical record:", error)
      toast({
        title: "Error",
        description: "Failed to delete medical record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadRecord = async (id: string, fileName: string) => {
    try {
      setIsDownloading(true)
      const blob = await medicalRecordsApi.downloadRecord(id)
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary anchor element
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      
      // Trigger the download
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: "Your file is being downloaded.",
      })
    } catch (error) {
      console.error("Error downloading medical record:", error)
      toast({
        title: "Error",
        description: "Failed to download the medical record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.totalPages) {
      setPaginationMeta(prev => ({ ...prev, currentPage: newPage }))
    }
  }

  // Skeleton loader component for records
  const RecordSkeleton = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardContent>
      <CardFooter className="bg-muted/50 pt-3 flex justify-between">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">
            {user?.role === "patient"
              ? "Access and manage your medical records securely"
              : "Manage patient medical records securely"}
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Medical Record</DialogTitle>
              <DialogDescription>Upload a new medical record to your secure health profile.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Select File</Label>
                <Input id="file" type="file" onChange={handleFileChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Record Type</Label>
                <Select 
                  value={uploadData.type} 
                  onValueChange={(value) => setUploadData({ ...uploadData, type: value })}
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
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Enter a description for this record"
                />
              </div>
              {user?.role === "doctor" && (
                <div className="grid gap-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={uploadData.patientId}
                    onChange={(e) => setUploadData({ ...uploadData, patientId: e.target.value })}
                    placeholder="Enter the patient's ID"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUpload} disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab_report">Lab Results</TabsTrigger>
          <TabsTrigger value="medical_history">Medical History</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && Array(6).fill(0).map((_, i) => (
              <RecordSkeleton key={i} />
            ))}
            {!isLoading && records.length === 0 && (
              <p className="col-span-full text-center py-8">No medical records found.</p>
            )}
            {!isLoading && records.map((record) => (
              <Card key={record.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{record.fileName}</CardTitle>
                  <CardDescription>
                    {new Date(record.createdAt).toLocaleDateString()} • {record.doctor.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="capitalize">{record.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm line-clamp-3">{record.description}</p>
                </CardContent>
                <CardFooter className="bg-muted/50 pt-3 flex justify-between">
                  <Button variant="outline" onClick={() => handleViewRecord(record.id)}>
                    <Lock className="mr-2 h-4 w-4" />
                    View Record
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination controls */}
          {paginationMeta.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(paginationMeta.currentPage - 1)}
                disabled={paginationMeta.currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm">
                Page {paginationMeta.currentPage} of {paginationMeta.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(paginationMeta.currentPage + 1)}
                disabled={paginationMeta.currentPage === paginationMeta.totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          )}
        </TabsContent>
        {["prescription", "lab_report", "medical_history"].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading && <p className="col-span-full text-center">Loading records...</p>}
              {!isLoading && records.filter(record => record.type === type).length === 0 && (
                <p className="col-span-full text-center">No {type.replace('_', ' ')} records found.</p>
              )}
              {!isLoading && records
                .filter((record) => record.type === type)
              .map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                      <CardTitle>{record.fileName}</CardTitle>
                    <CardDescription>
                        {new Date(record.createdAt).toLocaleDateString()} • {record.doctor.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm line-clamp-3">{record.description}</p>
                  </CardContent>
                    <CardFooter className="bg-muted/50 pt-3 flex justify-between">
                      <Button variant="outline" onClick={() => handleViewRecord(record.id)}>
                      <Lock className="mr-2 h-4 w-4" />
                        View Record
                    </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                        Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        ))}
      </Tabs>

      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedRecord.fileName}</DialogTitle>
              <DialogDescription>
                {new Date(selectedRecord.createdAt).toLocaleDateString()} • {selectedRecord.doctor.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="capitalize">{selectedRecord.type.replace('_', ' ')}</span>
              </div>
              <div className="rounded-md bg-muted p-4">
                <p>{selectedRecord.description}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Patient:</span>
                <span>{selectedRecord.patient.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">File Type:</span>
                <span>{selectedRecord.mimeType}</span>
              </div>
              {selectedRecord.isEncrypted && (
                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <Lock className="h-4 w-4" />
                  <span>This file is encrypted</span>
                </div>
              )}
              <div className="pt-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleDownloadRecord(selectedRecord.id, selectedRecord.fileName)}
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download File"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

