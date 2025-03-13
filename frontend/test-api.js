// Simple script to test the backend API
const axios = require('axios');

async function testBackendAPI() {
  try {
    console.log('Testing backend API...');
    
    // Test the registration endpoint
    const registrationData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongPass123!',
      role: 'patient'
    };
    
    console.log('Sending registration request to http://localhost:3002/api/v1/auth/register');
    const response = await axios.post('http://localhost:3002/api/v1/auth/register', registrationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.status, response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testBackendAPI(); 