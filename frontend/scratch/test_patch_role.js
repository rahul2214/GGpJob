const axios = require('axios');

async function testPatch() {
    const uid = '0f5f65a9-ab0a-45ec-b1f3-1476b4a9d928';
    const url = `http://localhost:9002/api/users/${uid}`;
    
    console.log(`Testing PATCH for user ${uid} on port 9002...`);
    
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notificationLastViewedAt: new Date().toISOString(),
                role: 'Employee'
            })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('User Role in response:', data.role);
        
        if (data.role === 'Employee') {
            console.log('SUCCESS: Role correctly returned as Employee');
        } else {
            console.error('FAILURE: Role returned as', data.role);
        }
    } catch (error) {
        console.error('Error during PATCH:', error.message);
    }
}

testPatch();
