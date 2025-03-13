import { CheckCircle } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      title: "Responsive Design",
      description: "Our application is fully responsive and works seamlessly across all devices and screen sizes.",
      category: "Design",
    },
    {
      title: "Fast Performance",
      description: "Optimized for speed with server-side rendering and efficient code splitting.",
      category: "Performance",
    },
    {
      title: "Secure Authentication",
      description: "Robust authentication system with multiple security layers to protect user data.",
      category: "Security",
    },
    {
      title: "Real-time Updates",
      description: "Get instant updates and notifications without refreshing the page.",
      category: "Functionality",
    },
    {
      title: "Intuitive Dashboard",
      description: "User-friendly dashboard with customizable widgets and data visualization.",
      category: "User Experience",
    },
    {
      title: "Advanced Analytics",
      description: "Comprehensive analytics to track performance and user behavior.",
      category: "Data",
    },
    {
      title: "API Integration",
      description: "Seamless integration with third-party services and APIs.",
      category: "Integration",
    },
    {
      title: "Offline Support",
      description: "Continue using the application even when offline with automatic syncing when back online.",
      category: "Functionality",
    },
    {
      title: "Customizable Themes",
      description: "Choose from multiple themes or create your own to match your brand.",
      category: "Design",
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Features</h1>

      <p className="text-lg mb-8">
        Our application comes packed with powerful features designed to enhance your experience and productivity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
              <h2 className="text-xl font-semibold">{feature.title}</h2>
            </div>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {feature.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

