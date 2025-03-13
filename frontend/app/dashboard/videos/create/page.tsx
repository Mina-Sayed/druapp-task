"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Loader2, Pause, Play, Save, Scissors, Upload, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function VideoCreatePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<string>("record")
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isTrimming, setIsTrimming] = useState<boolean>(false)
  const [videoTitle, setVideoTitle] = useState<string>("")
  const [videoDescription, setVideoDescription] = useState<string>("")
  const [videoPrivacy, setVideoPrivacy] = useState<string>("private")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100])

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Cleanup function to stop all media streams when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      // Set up media recorder once we have a stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: "video/mp4" })
        const videoUrl = URL.createObjectURL(videoBlob)
        setRecordedVideo(videoUrl)
        setIsProcessing(false)
        chunksRef.current = []
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera access denied",
        description: "Please grant permission to access your camera and microphone.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (activeTab === "record") {
      startCamera()
    }
  }, [activeTab])

  const startRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      chunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } else {
      toast({
        title: "Recording error",
        description: "Unable to start recording. Please refresh and try again.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file.",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 100MB for example)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video file must be less than 100MB.",
        variant: "destructive",
      })
      return
    }

    const videoUrl = URL.createObjectURL(file)
    setUploadedVideo(videoUrl)

    // Auto-populate title from filename
    if (!videoTitle) {
      const fileName = file.name.replace(/\.[^/.]+$/, "") // Remove extension
      setVideoTitle(fileName)
    }
  }

  const handleSave = () => {
    if (!videoTitle) {
      toast({
        title: "Title required",
        description: "Please enter a title for your video.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Video saved",
        description: "Your video has been successfully saved and processed.",
      })
      router.push("/dashboard/videos")
    }, 2000)
  }

  const handleDiscard = () => {
    // Stop any active streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    setRecordedVideo(null)
    setUploadedVideo(null)
    setIsTrimming(false)
    setVideoTitle("")
    setVideoDescription("")

    if (activeTab === "record") {
      startCamera()
    }
  }

  const toggleTrimming = () => {
    setIsTrimming(!isTrimming)
  }

  const handleTrimChange = (values: number[]) => {
    setTrimRange([values[0], values[1]])

    // In a real app, you would adjust the video playback time based on these values
    if (videoPreviewRef.current) {
      const video = videoPreviewRef.current
      const duration = video.duration
      const startTime = (duration * values[0]) / 100
      video.currentTime = startTime
    }
  }

  const currentVideo = recordedVideo || uploadedVideo

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Video</h1>
        <p className="text-muted-foreground">
          Record a new video or upload an existing one to share with your healthcare team
        </p>
      </div>

      <Tabs defaultValue="record" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record" disabled={!!recordedVideo || !!uploadedVideo}>
            <Camera className="h-4 w-4 mr-2" /> Record Video
          </TabsTrigger>
          <TabsTrigger value="upload" disabled={!!recordedVideo || !!uploadedVideo}>
            <Upload className="h-4 w-4 mr-2" /> Upload Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="mt-6">
          {!recordedVideo ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                        <p className="mt-2">Processing video...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 flex justify-center">
                  {!isRecording ? (
                    <Button onClick={startRecording} disabled={isProcessing}>
                      <Play className="h-4 w-4 mr-2" /> Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive" disabled={isProcessing}>
                      <Pause className="h-4 w-4 mr-2" /> Stop Recording
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          {!uploadedVideo ? (
            <Card>
              <CardContent className="pt-6">
                <div
                  className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("videoUpload")?.click()}
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Upload a video</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your video file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, or WEBM format up to 100MB</p>
                  <Input id="videoUpload" type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      {currentVideo && (
        <>
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative">
                  <video ref={videoPreviewRef} src={currentVideo} controls className="w-full h-full object-contain" />
                </div>
                <div className="p-4 flex justify-between">
                  <Button variant="ghost" onClick={handleDiscard}>
                    <X className="h-4 w-4 mr-2" /> Discard
                  </Button>
                  <div>
                    <Button variant="outline" onClick={toggleTrimming} className="mr-2">
                      <Scissors className="h-4 w-4 mr-2" /> {isTrimming ? "Cancel Trim" : "Trim Video"}
                    </Button>
                    <Button onClick={handleSave} disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Save Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isTrimming && (
              <Card>
                <CardContent className="pt-6">
                  <Label className="mb-2 block">Trim Video</Label>
                  <div className="py-6">
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={1}
                      value={[trimRange[0], trimRange[1]]}
                      onValueChange={handleTrimChange}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Start: {trimRange[0]}%</span>
                    <span>End: {trimRange[1]}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="videoTitle">Title</Label>
                <Input
                  id="videoTitle"
                  placeholder="Enter a title for your video"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="videoPrivacy">Privacy</Label>
                <Select value={videoPrivacy} onValueChange={setVideoPrivacy}>
                  <SelectTrigger id="videoPrivacy" className="mt-1">
                    <SelectValue placeholder="Select privacy setting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you can view)</SelectItem>
                    <SelectItem value="shared">Shared (You and your healthcare team)</SelectItem>
                    {user?.role === "doctor" && (
                      <SelectItem value="public">Public (All patients and doctors)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="videoDescription">Description</Label>
              <Textarea
                id="videoDescription"
                placeholder="Describe what's in your video"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

