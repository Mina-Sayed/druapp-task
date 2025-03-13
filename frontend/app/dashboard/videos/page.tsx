"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Clock, Eye, Film, Lock, MoreVertical, Plus, Share2, Trash2, Video } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for videos
const mockVideos = [
  {
    id: "1",
    title: "My Recovery Journey",
    description: "Sharing my progress after knee surgery",
    thumbnail: "/placeholder.svg?height=200&width=320",
    duration: "3:45",
    creator: "John Doe",
    creatorRole: "patient",
    createdAt: "2024-03-01",
    views: 24,
    privacy: "private",
  },
  {
    id: "2",
    title: "Common Symptoms of Hypertension",
    description: "Educational video about identifying hypertension symptoms",
    thumbnail: "/placeholder.svg?height=200&width=320",
    duration: "5:20",
    creator: "Dr. Sarah Johnson",
    creatorRole: "doctor",
    createdAt: "2024-02-28",
    views: 156,
    privacy: "public",
  },
  {
    id: "3",
    title: "Physical Therapy Exercises",
    description: "Recommended exercises for shoulder rehabilitation",
    thumbnail: "/placeholder.svg?height=200&width=320",
    duration: "8:12",
    creator: "Dr. Michael Chen",
    creatorRole: "doctor",
    createdAt: "2024-02-25",
    views: 87,
    privacy: "shared",
  },
  {
    id: "4",
    title: "My Medication Questions",
    description: "Questions for my next appointment",
    thumbnail: "/placeholder.svg?height=200&width=320",
    duration: "2:30",
    creator: "Jane Smith",
    creatorRole: "patient",
    createdAt: "2024-02-20",
    views: 3,
    privacy: "private",
  },
]

export default function VideosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [videos, setVideos] = useState(mockVideos)

  const handleDeleteVideo = (videoId: string) => {
    setVideos(videos.filter((video) => video.id !== videoId))
    toast({
      title: "Video deleted",
      description: "The video has been successfully deleted.",
    })
  }

  const handleShareVideo = (videoId: string) => {
    // In a real app, this would open a sharing dialog or generate a link
    toast({
      title: "Video shared",
      description: "A shareable link has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Collaboration</h1>
          <p className="text-muted-foreground">
            {user?.role === "patient"
              ? "Record and share videos with your healthcare providers"
              : "Create and share instructional videos with patients"}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/videos/create")} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Video
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="my-videos">My Videos</TabsTrigger>
          <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
          <TabsTrigger value="public">Public Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onDelete={handleDeleteVideo} onShare={handleShareVideo} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-videos" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.creatorRole === user?.role)
              .map((video) => (
                <VideoCard key={video.id} video={video} onDelete={handleDeleteVideo} onShare={handleShareVideo} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="shared-with-me" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.privacy === "shared" && video.creatorRole !== user?.role)
              .map((video) => (
                <VideoCard key={video.id} video={video} onDelete={handleDeleteVideo} onShare={handleShareVideo} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.privacy === "public")
              .map((video) => (
                <VideoCard key={video.id} video={video} onDelete={handleDeleteVideo} onShare={handleShareVideo} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface VideoCardProps {
  video: {
    id: string
    title: string
    description: string
    thumbnail: string
    duration: string
    creator: string
    creatorRole: string
    createdAt: string
    views: number
    privacy: string
  }
  onDelete: (id: string) => void
  onShare: (id: string) => void
}

function VideoCard({ video, onDelete, onShare }: VideoCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isOwner = user?.role === video.creatorRole

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 cursor-pointer"
          onClick={() => router.push(`/dashboard/videos/${video.id}`)}
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        <div className="absolute top-2 right-2">
          {video.privacy === "private" && (
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
              <Lock className="h-3 w-3 mr-1" /> Private
            </div>
          )}
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle
            className="text-lg line-clamp-1 mr-6 cursor-pointer"
            onClick={() => router.push(`/dashboard/videos/${video.id}`)}
          >
            {video.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/videos/${video.id}`)}>
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(video.id)}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem onClick={() => onDelete(video.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2 mt-1">{video.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {new Date(video.createdAt).toLocaleDateString()}
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <Eye className="h-3.5 w-3.5 mr-1" />
            {video.views} views
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t">
        <div className="flex items-center w-full">
          <div className="h-8 w-8 rounded-full bg-muted mr-2 flex items-center justify-center">
            {video.creatorRole === "doctor" ? (
              <Film className="h-4 w-4 text-primary" />
            ) : (
              <Video className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="text-sm">
            <p className="font-medium">{video.creator}</p>
            <p className="text-xs text-muted-foreground capitalize">{video.creatorRole}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

