async function testAPI() {
  console.log('Testing API connectivity...');
  
  try {
    // Test GET /api/herbs
    console.log('\n1. Testing GET /api/herbs...');
    const getResponse = await fetch('http://localhost:8080/api/herbs');
    console.log(`Status: ${getResponse.status}`);
    console.log('Content-Type:', getResponse.headers.get('content-type'));
    
    if (getResponse.ok) {
      const herbs = await getResponse.json();
      console.log(`Response:`, herbs);
      if (Array.isArray(herbs)) {
        console.log(`Found ${herbs.length} herbs`);
        console.log('First few herbs:', herbs.slice(0, 2));
      } else {
        console.log('Response is not an array:', typeof herbs);
      }
    } else {
      const errorText = await getResponse.text();
      console.log('Error response:', errorText);
    }

    // Test POST /api/herbs
    console.log('\n2. Testing POST /api/herbs...');
    const testData = {
      herbId: `TEST-${Date.now()}-API`,
      name: "Test Herb API Direct",
      collector: "API Test Farmer", // Changed from farmerName to collector
      geoTag: {
        latitude: 28.6139, // API expects latitude, not lat
        longitude: 77.209,  // API expects longitude, not lng
        location: "Test Address" // Changed from address to location
      },
      harvestDate: new Date().toISOString(),
      quantity: 1, // Changed to number
      unit: "kg",
      quality: "A" // Added required field
    };

    const postResponse = await fetch('http://localhost:8080/api/herbs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`POST Status: ${postResponse.status}`);
    
    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('POST Success:', result);
    } else {
      const errorText = await postResponse.text();
      console.log('POST Error:', errorText);
    }

    // Test health endpoint
    console.log('\n3. Testing /health...');
    const healthResponse = await fetch('http://localhost:8080/health');
    console.log(`Health Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('Health:', health);
    }

  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testAPI();