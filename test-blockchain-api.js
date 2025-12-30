// Simple blockchain integration test
const test = async () => {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:8080/api/herbs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        herbId: 'TEST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3).toUpperCase(),
        name: 'Test Blockchain Herb',
        collector: 'Test Collector',
        harvestDate: '2025-10-05',
        geoTag: {
          latitude: 28.7041,
          longitude: 77.1025
        },
        status: 'Collected',
        quantity: 1,
        unit: 'kg',
        quality: 'A',
        useBlockchain: true // This should trigger blockchain integration
      })
    });

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ Herb successfully added to database');
      if (result.data.blockchainTx) {
        console.log('✅ Blockchain transaction hash:', result.data.blockchainTx);
      } else {
        console.log('⚠️  No blockchain transaction hash found');
      }
    } else {
      console.log('❌ Failed to add herb:', result.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

test();