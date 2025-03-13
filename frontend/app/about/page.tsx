export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Welcome to our company! We are dedicated to providing high-quality solutions and services to our customers.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
        <p className="mb-4">
          Founded in 2020, our company began with a simple mission: to create innovative solutions that make a
          difference. What started as a small team of passionate individuals has grown into a thriving organization with
          a global presence.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="mb-4">
          Our mission is to empower businesses and individuals with cutting-edge technology that simplifies complex
          problems. We believe in sustainable growth, ethical practices, and putting our customers first.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
        <p className="mb-4">
          Our diverse team brings together expertise from various fields including software development, design,
          marketing, and customer support. We value collaboration, innovation, and continuous learning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Innovation</h3>
            <p>We constantly push the boundaries of what's possible with technology.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Quality</h3>
            <p>We are committed to delivering products and services of the highest quality.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Integrity</h3>
            <p>We conduct our business with honesty, transparency, and ethical standards.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

