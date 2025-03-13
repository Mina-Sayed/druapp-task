"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader, Search, AlertCircle, ThumbsUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Mock symptom analysis function (in a real app, this would call an AI service)
const analyzeSymptoms = async (symptoms: string, duration: string, severity: string, additionalInfo: string[]) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simple keyword-based analysis (this would be replaced with a real AI model)
  const symptomsLower = symptoms.toLowerCase()

  if (symptomsLower.includes("headache") || symptomsLower.includes("head pain")) {
    return {
      possibleConditions: [
        {
          name: "Tension Headache",
          probability: "High",
          description:
            "Common headache with mild to moderate pain, often described as feeling like a tight band around the head.",
        },
        {
          name: "Migraine",
          probability: "Medium",
          description: "Recurring headache, moderate to severe, often with nausea and sensitivity to light and sound.",
        },
        {
          name: "Sinusitis",
          probability: "Low",
          description:
            "Inflammation of the sinuses, often causing pain and pressure in the face, head, and behind the eyes.",
        },
      ],
      recommendations: [
        "Stay hydrated and rest in a quiet, dark room",
        "Over-the-counter pain relievers may help relieve symptoms",
        "If symptoms persist for more than 3 days or are severe, consult a healthcare provider",
      ],
      urgency: "Low",
    }
  } else if (symptomsLower.includes("fever") || symptomsLower.includes("high temperature")) {
    return {
      possibleConditions: [
        {
          name: "Common Cold",
          probability: "High",
          description: "Viral infection causing fever, runny nose, sore throat, and general discomfort.",
        },
        {
          name: "Influenza",
          probability: "Medium",
          description: "Viral infection with fever, body aches, fatigue, and respiratory symptoms.",
        },
        {
          name: "COVID-19",
          probability: "Medium",
          description: "Viral infection with fever, cough, fatigue, and potential loss of taste or smell.",
        },
      ],
      recommendations: [
        "Rest and stay hydrated",
        "Take over-the-counter fever reducers as directed",
        "Monitor temperature and seek medical attention if fever exceeds 103°F (39.4°C) or lasts more than 3 days",
      ],
      urgency: "Medium",
    }
  } else if (symptomsLower.includes("cough") || symptomsLower.includes("sore throat")) {
    return {
      possibleConditions: [
        {
          name: "Common Cold",
          probability: "High",
          description: "Viral infection with cough, sore throat, and nasal congestion.",
        },
        {
          name: "Bronchitis",
          probability: "Medium",
          description: "Inflammation of the bronchial tubes with cough, mucus production, and sometimes wheezing.",
        },
        {
          name: "Strep Throat",
          probability: "Low",
          description: "Bacterial infection causing severe sore throat, pain when swallowing, and fever.",
        },
      ],
      recommendations: [
        "Rest your voice and stay hydrated",
        "Gargle with warm salt water for sore throat relief",
        "Use honey and lemon in warm water for cough (if not diabetic and over 1 year old)",
        "Seek medical attention if symptoms worsen or persist beyond 7-10 days",
      ],
      urgency: "Low",
    }
  } else if (symptomsLower.includes("chest pain") || symptomsLower.includes("difficulty breathing")) {
    return {
      possibleConditions: [
        {
          name: "Anxiety/Panic Attack",
          probability: "Medium",
          description: "Episodes of intense fear with chest pain, rapid heartbeat, and shortness of breath.",
        },
        {
          name: "Angina",
          probability: "Medium",
          description: "Chest pain due to reduced blood flow to the heart muscle.",
        },
        {
          name: "Myocardial Infarction",
          probability: "Low",
          description: "Heart attack with chest pain, pressure, and often radiating pain to arm, jaw, or back.",
        },
      ],
      recommendations: [
        "Seek immediate medical attention or call emergency services",
        "If history of anxiety, try deep breathing exercises while waiting for help",
        "Do not ignore chest pain or difficulty breathing",
      ],
      urgency: "High",
    }
  } else {
    return {
      possibleConditions: [
        {
          name: "Multiple possibilities",
          probability: "Unknown",
          description: "Based on the symptoms provided, multiple conditions could be possible.",
        },
      ],
      recommendations: [
        "Monitor your symptoms and keep track of any changes",
        "Schedule an appointment with your healthcare provider for proper diagnosis",
        "Maintain good hydration and rest",
      ],
      urgency: "Medium",
    }
  }
}

export default function SymptomCheckerPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [symptoms, setSymptoms] = useState("")
  const [duration, setDuration] = useState("1-3 days")
  const [severity, setSeverity] = useState("moderate")
  const [additionalInfo, setAdditionalInfo] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [disclaimer, setDisclaimer] = useState(false)

  const handleCheckSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "We need a description of your symptoms to provide an analysis.",
        variant: "destructive",
      })
      return
    }

    if (!disclaimer) {
      toast({
        title: "Please acknowledge the disclaimer",
        description: "You must acknowledge the disclaimer before using the symptom checker.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      const analysis = await analyzeSymptoms(symptoms, duration, severity, additionalInfo)
      setResult(analysis)
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your symptoms. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Only patients should have access to the symptom checker
  if (user?.role !== "patient") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          The symptom checker is only available for patients. As a healthcare provider, you can access patient records
          and consultations instead.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Symptom Checker</h1>
        <p className="text-muted-foreground">
          Describe your symptoms to get AI-powered preliminary advice. This is not a substitute for professional medical
          diagnosis.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe Your Symptoms</CardTitle>
          <CardDescription>Provide as much detail as possible about what you're experiencing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              placeholder="Describe your symptoms in detail (e.g., 'I have a headache, fever, and sore throat')"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="less than 24 hours">Less than 24 hours</SelectItem>
                  <SelectItem value="1-3 days">1-3 days</SelectItem>
                  <SelectItem value="4-7 days">4-7 days</SelectItem>
                  <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                  <SelectItem value="more than 2 weeks">More than 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild - Noticeable but not interfering with daily activities</SelectItem>
                  <SelectItem value="moderate">Moderate - Somewhat interfering with daily activities</SelectItem>
                  <SelectItem value="severe">Severe - Significantly interfering with daily activities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Additional Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { id: "fever", label: "I have a fever" },
                { id: "medication", label: "I'm taking medication" },
                { id: "chronic", label: "I have chronic health conditions" },
                { id: "allergies", label: "I have allergies" },
                { id: "pregnant", label: "I am pregnant or nursing" },
                { id: "travel", label: "I recently traveled" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={additionalInfo.includes(item.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAdditionalInfo([...additionalInfo, item.id])
                      } else {
                        setAdditionalInfo(additionalInfo.filter((id) => id !== item.id))
                      }
                    }}
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="disclaimer"
              checked={disclaimer}
              onCheckedChange={(checked) => setDisclaimer(checked as boolean)}
            />
            <label htmlFor="disclaimer" className="text-sm text-muted-foreground">
              I understand that this is not a medical diagnosis and I should consult a healthcare professional for
              proper medical advice.
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCheckSymptoms} disabled={isAnalyzing || !symptoms.trim()} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Check Symptoms
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Analysis Results
              {result.urgency === "High" && (
                <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Urgent</span>
              )}
              {result.urgency === "Medium" && (
                <span className="ml-2 text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Moderate Concern
                </span>
              )}
              {result.urgency === "Low" && (
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Low Concern</span>
              )}
            </CardTitle>
            <CardDescription>Based on the symptoms you described, here's a preliminary analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Possible Conditions</h3>
              <div className="space-y-3">
                {result.possibleConditions.map((condition: any, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">{condition.name}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          condition.probability === "High"
                            ? "bg-amber-100 text-amber-800"
                            : condition.probability === "Medium"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {condition.probability} probability
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{condition.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <ThumbsUp className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> This is an AI-generated preliminary assessment and not a medical diagnosis.
                Please consult with a healthcare professional for proper medical advice and treatment.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setResult(null)}>
              Start Over
            </Button>
            <Button onClick={() => (window.location.href = "/dashboard/appointments")}>Book Appointment</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

