"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, Mic, MicOff, Phone, Video, VideoOff, User } from "lucide-react"

// Mock data for consultations
const mockConsultations = [
  {
    id: "1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2024-03-10",
    time: "10:00 AM",
    status: "scheduled",
    notes: "Annual heart checkup",
  },
  {
    id: "2",
    doctorName: "Dr. Michael Chen",
    specialty: "Neurology",
    date: "2024-03-15",
    time: "2:30 PM",
    status: "scheduled",
    notes: "Follow-up on headaches",
  },
  {
    id: "3",
    doctorName: "Dr. Emily Wilson",
    specialty: "Dermatology",
    date: "2024-03-08",
    time: "4:15 PM",
    status: "completed",
    notes: "Skin condition follow-up",
  },
]

export default function ConsultationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [consultations, setConsultations] = useState(mockConsultations)
  const [activeConsultation, setActiveConsultation] = useState<any>(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const startConsultation = (consultation: any) => {
    setActiveConsultation(consultation)
    setIsDialogOpen(true)
  }

  const endConsultation = () => {
    toast({
      title: "Consultation Ended",
      description: "Your video consultation has ended.",
    })

    setConsultations(consultations.map((c) => (c.id === activeConsultation.id ? { ...c, status: "completed" } : c)))

    setIsDialogOpen(false)
    setActiveConsultation(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Consultations</h1>
        <p className="text-muted-foreground">
          {user?.role === "patient"
            ? "Connect with your healthcare providers through secure video consultations"
            : "Connect with your patients through secure video consultations"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {consultations.map((consultation) => (
          <Card key={consultation.id}>
            <CardHeader>
              <CardTitle>{consultation.doctorName}</CardTitle>
              <CardDescription>{consultation.specialty}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">{new Date(consultation.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time:</span>
                  <span className="text-sm">{consultation.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center">
                    {consultation.status === "scheduled" ? (
                      <div className="flex items-center text-amber-600">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm">Scheduled</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span className="text-sm">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {consultation.status === "scheduled" && (
                <Button className="w-full" onClick={() => startConsultation(consultation)}>
                  <Video className="mr-2 h-4 w-4" />
                  Join Consultation
                </Button>
              )}
              {consultation.status === "completed" && (
                <Button variant="outline" className="w-full" disabled>
                  Consultation Completed
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{activeConsultation?.doctorName} - Video Consultation</DialogTitle>
            <DialogDescription>Secure end-to-end encrypted video consultation</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="h-16 w-16 text-muted-foreground opacity-50" />
              </div>
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-background rounded-lg border shadow-sm overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => setIsAudioOn(!isAudioOn)}
              >
                {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6 text-destructive" />}
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endConsultation}>
                <Phone className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6 text-destructive" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

