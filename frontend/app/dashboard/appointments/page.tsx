"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Check, Clock, X } from "lucide-react"

// Mock data for appointments
const mockAppointments = [
  {
    id: "1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2024-03-10",
    time: "10:00 AM",
    status: "confirmed",
    notes: "Annual heart checkup",
  },
  {
    id: "2",
    doctorName: "Dr. Michael Chen",
    specialty: "Neurology",
    date: "2024-03-15",
    time: "2:30 PM",
    status: "pending",
    notes: "Follow-up on headaches",
  },
  {
    id: "3",
    doctorName: "Dr. Emily Wilson",
    specialty: "Dermatology",
    date: "2024-03-20",
    time: "4:15 PM",
    status: "confirmed",
    notes: "Skin condition follow-up",
  },
]

// Mock data for doctors
const mockDoctors = [
  { id: "1", name: "Dr. Sarah Johnson", specialty: "Cardiology" },
  { id: "2", name: "Dr. Michael Chen", specialty: "Neurology" },
  { id: "3", name: "Dr. Emily Wilson", specialty: "Dermatology" },
  { id: "4", name: "Dr. Robert Davis", specialty: "Orthopedics" },
  { id: "5", name: "Dr. Lisa Wang", specialty: "Pediatrics" },
]

// Form schema for booking appointment
const appointmentFormSchema = z.object({
  doctorId: z.string({
    required_error: "Please select a doctor",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  reason: z.string().min(5, {
    message: "Reason must be at least 5 characters",
  }),
})

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState(mockAppointments)
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      reason: "",
    },
  })

  const onSubmit = (data: z.infer<typeof appointmentFormSchema>) => {
    // In a real app, you would make an API call to book the appointment
    const doctor = mockDoctors.find((d) => d.id === data.doctorId)

    const newAppointment = {
      id: Math.random().toString(36).substring(7),
      doctorName: doctor?.name || "",
      specialty: doctor?.specialty || "",
      date: data.date.toISOString().split("T")[0],
      time: data.time,
      status: "pending",
      notes: data.reason,
    }

    setAppointments([...appointments, newAppointment])

    toast({
      title: "Appointment Requested",
      description: `Your appointment with ${doctor?.name} on ${data.date.toLocaleDateString()} at ${data.time} has been requested.`,
    })

    setOpen(false)
    form.reset()
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setAppointments(
      appointments.map((appointment) => (appointment.id === id ? { ...appointment, status: newStatus } : appointment)),
    )

    toast({
      title: `Appointment ${newStatus === "confirmed" ? "Confirmed" : "Cancelled"}`,
      description: `The appointment has been ${newStatus === "confirmed" ? "confirmed" : "cancelled"}.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            {user?.role === "patient" ? "Manage your healthcare appointments" : "Manage your patient appointments"}
          </p>
        </div>
        {user?.role === "patient" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Book Appointment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book an Appointment</DialogTitle>
                <DialogDescription>
                  Fill out the form below to request an appointment with a healthcare provider.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Healthcare Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockDoctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                          }
                          className="rounded-md border"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                            <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                            <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                            <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                            <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                            <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                            <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Visit</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your symptoms or reason for the appointment"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Request Appointment</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardHeader>
              <CardTitle>{appointment.doctorName}</CardTitle>
              <CardDescription>{appointment.specialty}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">{new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time:</span>
                  <span className="text-sm">{appointment.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center">
                    {appointment.status === "confirmed" ? (
                      <div className="flex items-center text-green-600">
                        <Check className="mr-1 h-4 w-4" />
                        <span className="text-sm">Confirmed</span>
                      </div>
                    ) : appointment.status === "pending" ? (
                      <div className="flex items-center text-amber-600">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm">Pending</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <X className="mr-1 h-4 w-4" />
                        <span className="text-sm">Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {user?.role === "doctor" && appointment.status === "pending" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleStatusChange(appointment.id, "cancelled")}>
                    Decline
                  </Button>
                  <Button size="sm" onClick={() => handleStatusChange(appointment.id, "confirmed")}>
                    Confirm
                  </Button>
                </>
              )}
              {user?.role === "patient" && appointment.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleStatusChange(appointment.id, "cancelled")}
                >
                  Cancel Request
                </Button>
              )}
              {appointment.status === "confirmed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleStatusChange(appointment.id, "cancelled")}
                >
                  Cancel Appointment
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

