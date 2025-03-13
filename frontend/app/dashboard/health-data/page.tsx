"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Activity, AlertCircle, Heart, TrendingUp, Droplets, Scale, Zap } from "lucide-react"

// Mock health data that would come from Apple HealthKit or Google Fit
const mockHealthData = {
  steps: [
    { date: "2024-03-01", value: 8432 },
    { date: "2024-03-02", value: 10253 },
    { date: "2024-03-03", value: 7654 },
    { date: "2024-03-04", value: 9123 },
    { date: "2024-03-05", value: 11542 },
    { date: "2024-03-06", value: 8765 },
    { date: "2024-03-07", value: 9876 },
  ],
  heartRate: [
    { date: "2024-03-01", value: 72 },
    { date: "2024-03-02", value: 75 },
    { date: "2024-03-03", value: 68 },
    { date: "2024-03-04", value: 70 },
    { date: "2024-03-05", value: 73 },
    { date: "2024-03-06", value: 71 },
    { date: "2024-03-07", value: 69 },
  ],
  bloodPressure: [
    { date: "2024-03-01", systolic: 120, diastolic: 80 },
    { date: "2024-03-02", systolic: 118, diastolic: 78 },
    { date: "2024-03-03", systolic: 122, diastolic: 82 },
    { date: "2024-03-04", systolic: 119, diastolic: 79 },
    { date: "2024-03-05", systolic: 121, diastolic: 81 },
    { date: "2024-03-06", systolic: 117, diastolic: 77 },
    { date: "2024-03-07", systolic: 120, diastolic: 80 },
  ],
  weight: [
    { date: "2024-03-01", value: 70.5 },
    { date: "2024-03-02", value: 70.3 },
    { date: "2024-03-03", value: 70.4 },
    { date: "2024-03-04", value: 70.2 },
    { date: "2024-03-05", value: 70.1 },
    { date: "2024-03-06", value: 70.0 },
    { date: "2024-03-07", value: 69.8 },
  ],
  sleep: [
    { date: "2024-03-01", hours: 7.5 },
    { date: "2024-03-02", hours: 8.2 },
    { date: "2024-03-03", hours: 6.8 },
    { date: "2024-03-04", hours: 7.3 },
    { date: "2024-03-05", hours: 7.7 },
    { date: "2024-03-06", hours: 8.0 },
    { date: "2024-03-07", hours: 7.2 },
  ],
  calories: [
    { date: "2024-03-01", value: 2150 },
    { date: "2024-03-02", value: 2320 },
    { date: "2024-03-03", value: 2080 },
    { date: "2024-03-04", value: 2210 },
    { date: "2024-03-05", value: 2280 },
    { date: "2024-03-06", value: 2190 },
    { date: "2024-03-07", value: 2240 },
  ],
}

export default function HealthDataPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [healthData, setHealthData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate loading health data from an API
    const loadHealthData = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call to fetch data from HealthKit/Google Fit
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setHealthData(mockHealthData)
        setIsConnected(true)
      } catch (error) {
        console.error("Error loading health data:", error)
        toast({
          title: "Failed to load health data",
          description: "There was an error loading your health data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadHealthData()
  }, [toast])

  const connectHealthApp = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would trigger the OAuth flow with HealthKit/Google Fit
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setHealthData(mockHealthData)
      setIsConnected(true)
      toast({
        title: "Health app connected",
        description: "Your health data has been successfully synced.",
      })
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to health app. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Only patients should have access to health data
  if (user?.role !== "patient") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          Health data integration is only available for patients. As a healthcare provider, you can access patient
          records and consultations instead.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground">Loading health data...</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Data Integration</h1>
          <p className="text-muted-foreground">Connect your health app to sync your health data with MediConnect.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Connect Your Health App</CardTitle>
            <CardDescription>
              Sync your health data from Apple HealthKit or Google Fit to share with your healthcare providers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Apple HealthKit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Connect with Apple HealthKit to sync your health data from your iPhone or Apple Watch.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={connectHealthApp}>
                    Connect
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Google Fit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Connect with Google Fit to sync your health data from your Android device or wearables.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={connectHealthApp}>
                    Connect
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Privacy Note:</strong> Your health data is encrypted and only shared with healthcare providers
                you explicitly authorize. You can disconnect at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Data</h1>
        <p className="text-muted-foreground">View and manage your health data synced from your health app.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Steps</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.steps[healthData.steps.length - 1].value}</div>
            <p className="text-xs text-muted-foreground">
              {healthData.steps[healthData.steps.length - 1].value >
              healthData.steps[healthData.steps.length - 2].value ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {Math.abs(
                    healthData.steps[healthData.steps.length - 1].value -
                      healthData.steps[healthData.steps.length - 2].value,
                  )}{" "}
                  more than yesterday
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  {Math.abs(
                    healthData.steps[healthData.steps.length - 1].value -
                      healthData.steps[healthData.steps.length - 2].value,
                  )}{" "}
                  less than yesterday
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.heartRate[healthData.heartRate.length - 1].value} bpm</div>
            <p className="text-xs text-muted-foreground">
              Average:{" "}
              {Math.round(
                healthData.heartRate.reduce((acc: number, curr: any) => acc + curr.value, 0) /
                  healthData.heartRate.length,
              )}{" "}
              bpm
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData.bloodPressure[healthData.bloodPressure.length - 1].systolic}/
              {healthData.bloodPressure[healthData.bloodPressure.length - 1].diastolic}
            </div>
            <p className="text-xs text-muted-foreground">
              Last measured:{" "}
              {new Date(healthData.bloodPressure[healthData.bloodPressure.length - 1].date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.weight[healthData.weight.length - 1].value} kg</div>
            <p className="text-xs text-muted-foreground">
              {healthData.weight[0].value - healthData.weight[healthData.weight.length - 1].value > 0 ? (
                <span className="text-green-600">
                  Lost {(healthData.weight[0].value - healthData.weight[healthData.weight.length - 1].value).toFixed(1)}{" "}
                  kg this week
                </span>
              ) : (
                <span className="text-amber-600">
                  Gained{" "}
                  {Math.abs(healthData.weight[0].value - healthData.weight[healthData.weight.length - 1].value).toFixed(
                    1,
                  )}{" "}
                  kg this week
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.sleep[healthData.sleep.length - 1].hours} hours</div>
            <p className="text-xs text-muted-foreground">
              Average:{" "}
              {(
                healthData.sleep.reduce((acc: number, curr: any) => acc + curr.hours, 0) / healthData.sleep.length
              ).toFixed(1)}{" "}
              hours per night
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.calories[healthData.calories.length - 1].value} kcal</div>
            <p className="text-xs text-muted-foreground">
              Average:{" "}
              {Math.round(
                healthData.calories.reduce((acc: number, curr: any) => acc + curr.value, 0) /
                  healthData.calories.length,
              )}{" "}
              kcal per day
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="heart">Heart Rate</TabsTrigger>
          <TabsTrigger value="bp">Blood Pressure</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="calories">Calories</TabsTrigger>
        </TabsList>
        <TabsContent value="steps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Steps History</CardTitle>
              <CardDescription>Your daily step count for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <div className="flex h-full items-end">
                  {healthData.steps.map((day: any, index: number) => (
                    <div key={index} className="relative flex h-full w-full flex-col items-center justify-end">
                      <div
                        className="w-full bg-primary/90 rounded-t-sm"
                        style={{ height: `${(day.value / 12000) * 100}%` }}
                      ></div>
                      <span className="mt-2 text-xs">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="heart" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate History</CardTitle>
              <CardDescription>Your average heart rate for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <div className="flex h-full items-end">
                  {healthData.heartRate.map((day: any, index: number) => (
                    <div key={index} className="relative flex h-full w-full flex-col items-center justify-end">
                      <div
                        className="w-full bg-red-500/90 rounded-t-sm"
                        style={{ height: `${(day.value / 100) * 100}%` }}
                      ></div>
                      <span className="mt-2 text-xs">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bp" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure History</CardTitle>
              <CardDescription>Your blood pressure readings for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthData.bloodPressure.map((reading: any, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <span>{new Date(reading.date).toLocaleDateString()}</span>
                    <span className="font-medium">
                      {reading.systolic}/{reading.diastolic} mmHg
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weight" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Weight History</CardTitle>
              <CardDescription>Your weight measurements for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <div className="flex h-full items-end">
                  {healthData.weight.map((day: any, index: number) => (
                    <div key={index} className="relative flex h-full w-full flex-col items-center justify-end">
                      <div
                        className="w-full bg-blue-500/90 rounded-t-sm"
                        style={{ height: `${(day.value / 100) * 100}%` }}
                      ></div>
                      <span className="mt-2 text-xs">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sleep" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sleep History</CardTitle>
              <CardDescription>Your sleep duration for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <div className="flex h-full items-end">
                  {healthData.sleep.map((day: any, index: number) => (
                    <div key={index} className="relative flex h-full w-full flex-col items-center justify-end">
                      <div
                        className="w-full bg-purple-500/90 rounded-t-sm"
                        style={{ height: `${(day.hours / 10) * 100}%` }}
                      ></div>
                      <span className="mt-2 text-xs">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Calories History</CardTitle>
              <CardDescription>Your calorie intake for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <div className="flex h-full items-end">
                  {healthData.calories.map((day: any, index: number) => (
                    <div key={index} className="relative flex h-full w-full flex-col items-center justify-end">
                      <div
                        className="w-full bg-orange-500/90 rounded-t-sm"
                        style={{ height: `${(day.value / 3000) * 100}%` }}
                      ></div>
                      <span className="mt-2 text-xs">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Share Health Data</CardTitle>
          <CardDescription>Choose which health data to share with your healthcare providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "steps", label: "Steps", icon: Activity },
                { id: "heart", label: "Heart Rate", icon: Heart },
                { id: "bp", label: "Blood Pressure", icon: Droplets },
                { id: "weight", label: "Weight", icon: Scale },
                { id: "sleep", label: "Sleep", icon: Activity },
                { id: "calories", label: "Calories", icon: Zap },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2 p-3 border rounded-md">
                  <input
                    type="checkbox"
                    id={`share-${item.id}`}
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`share-${item.id}`} className="flex items-center text-sm font-medium">
                    <item.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Save Sharing Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

