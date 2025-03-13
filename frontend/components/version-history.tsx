import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, Clock, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { medicalRecordsApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Version {
  id: string
  versionNumber: number
  fileName: string
  mimeType: string
  description: string
  modifiedBy: {
    id: string
    name: string
  }
  changeReason: string
  createdAt: string
}

interface PaginationMeta {
  totalItems: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

interface VersionHistoryProps {
  recordId: string
  isOpen: boolean
  onClose: () => void
}

export function VersionHistory({ recordId, isOpen, onClose }: VersionHistoryProps) {
  const { toast } = useToast()
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingVersionId, setDownloadingVersionId] = useState<string | null>(null)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    totalItems: 0,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  })

  // Fetch versions when dialog opens with proper cleanup
  useEffect(() => {
    let isMounted = true
    
    if (isOpen && recordId) {
      const fetchData = async () => {
        try {
          setIsLoading(true)
          const response = await medicalRecordsApi.getRecordVersions(
            recordId,
            paginationMeta.currentPage,
            paginationMeta.itemsPerPage
          )
          
          if (isMounted) {
            setVersions(response.items)
            setPaginationMeta(response.meta)
          }
        } catch (error) {
          if (isMounted) {
            console.error("Error fetching versions:", error)
            toast({
              title: "Error",
              description: "Failed to fetch version history. Please try again.",
              variant: "destructive",
            })
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }
      
      fetchData()
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [isOpen, recordId, toast, paginationMeta.currentPage])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.totalPages) {
      setPaginationMeta(prev => ({ ...prev, currentPage: newPage }))
    }
  }

  const handleDownloadVersion = async (versionId: string, fileName: string) => {
    try {
      setIsDownloading(true)
      setDownloadingVersionId(versionId)
      const blob = await medicalRecordsApi.getVersionContent(recordId, versionId)
      
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
        description: "Your file version is being downloaded.",
      })
    } catch (error) {
      console.error("Error downloading version:", error)
      toast({
        title: "Error",
        description: "Failed to download the version. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
      setDownloadingVersionId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and download previous versions of this medical record
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No version history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Modified By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          <span>v{version.versionNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(version.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{version.modifiedBy.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {version.changeReason}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadVersion(version.id, version.fileName)}
                          disabled={isDownloading && downloadingVersionId === version.id}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {isDownloading && downloadingVersionId === version.id 
                            ? "Downloading..." 
                            : "Download"
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {paginationMeta.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
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
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 