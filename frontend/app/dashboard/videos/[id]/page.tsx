"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Clock, Download, Eye, Film, MessageSquare, Share2, ThumbsUp, User, Video } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock video data
const mockVideoData = {
  id: "1",
  title: "My Recovery Journey",
  description:
    "In this video, I'm sharing my experience and progress after knee surgery. I discuss the challenges I faced during recovery and the physical therapy exercises that helped me the most.",
  videoUrl: "/placeholder.svg?height=720&width=1280", // In a real app, this would be a video URL
  creator: "John Doe",
  creatorRole: "patient",
  createdAt: "2024-03-01T10:30:00Z",
  views: 24,
  likes: 8,
  privacy: "shared",
  relatedVideos: [
    {
      id: "3",
      title: "Physical Therapy Exercises",
      thumbnail: "/placeholder.svg?height=100&width=180",
      duration: "8:12",
      creator: "Dr. Michael Chen",
      creatorRole: "doctor",
    },
    {
      id: "2",
      title: "Common Symptoms of Hypertension",
      thumbnail: "/placeholder.svg?height=100&width=180",
      duration: "5:20",
      creator: "Dr. Sarah Johnson",
      creatorRole: "doctor",
    },
  ],
}

// Mock comments
const mockComments = [
  {
    id: "1",
    author: "Dr. Sarah Johnson",
    authorRole: "doctor",
    content:
      "Thank you for sharing your journey! It's great to see your progress. Keep up with the exercises we discussed.",
    timestamp: "2024-03-01T14:45:00Z",
  },
  {
    id: "2",
    author: "Emily Wilson",
    authorRole: "patient",
    content:
      "This is really helpful. I'm about to have knee surgery next month and was feeling anxious about the recovery process.",
    timestamp: "2024-03-02T09:20:00Z",
  },
]

export default function VideoViewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoData, setVideoData] = useState(mockVideoData)
  const [comments, setComments] = useState(mockComments)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const handleLike = () => {
    setIsLiked(!isLiked)

    // Update like count
    setVideoData((prev) => ({
      ...prev,
      likes: isLiked ? prev.likes - 1 : prev.likes + 1,
    }))

    if (!isLiked) {
      toast({
        title: "Video liked",
        description: "You liked this video",
      })
    }
  }

  const handleShare = () => {
    // In a real app, this would open a sharing dialog or generate a link
    toast({
      title: "Video shared",
      description: "A shareable link has been copied to your clipboard.",
    })
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    const newCommentObj = {
      id: `comment-${Date.now()}`,
      author: user?.name || "Anonymous",
      authorRole: user?.role || "patient",
      content: newComment,
      timestamp: new Date().toISOString(),
    }

    setComments([newCommentObj, ...comments])
    setNewComment("")

    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully.",
    })
  }

  const handleDownload = () => {
    // In a real app, this would trigger a download
    toast({
      title: "Download started",
      description: "Your video is being downloaded.",
    })
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-2 -ml-2 flex items-center text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to videos
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-muted">
                <video
                  ref={videoRef}
                  src={videoData.videoUrl}
                  controls
                  poster="/placeholder.svg?height=720&width=1280"
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>

          <div>
            <h1 className="text-2xl font-bold mb-2">{videoData.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {videoData.views} views
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(videoData.createdAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleLike} className={isLiked ? "text-primary" : ""}>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {videoData.likes}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 border rounded-lg">
            <div className="mr-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {videoData.creatorRole === "doctor" ? (
                    <Film className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="font-medium">{videoData.creator}</h3>
              <p className="text-sm text-muted-foreground capitalize">{videoData.creatorRole}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">
                <Video className="h-4 w-4 mr-2" /> Details
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" /> Comments ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">{videoData.description}</p>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button type="submit" disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </form>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>
                          {comment.authorRole === "doctor" ? (
                            <Film className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground ml-2 capitalize">{comment.authorRole}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm ml-10">{comment.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Videos</CardTitle>
              <CardDescription>Videos you might be interested in</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {videoData.relatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex p-4 hover:bg-muted cursor-pointer"
                    onClick={() => router.push(`/dashboard/videos/${video.id}`)}
                  >
                    <div className="relative w-24 h-16 mr-3 flex-shrink-0">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{video.creator}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard/videos")}>
                View All Videos
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded by:</span>
                  <span className="font-medium">{videoData.creator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(videoData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Privacy:</span>
                  <span className="capitalize">{videoData.privacy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

