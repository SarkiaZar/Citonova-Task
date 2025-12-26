const fetch = require('node-fetch'); // Assuming node-fetch is available or using global fetch if node 18+

const API_URL = 'https://basic-hono-api.borisbelmarm.workers.dev';

async function testLogin() {
    console.log('Testing login to:', API_URL);
    const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
    const password = 'password123';

    try {
        // Try register
        console.log(`Testing register with ${randomEmail}...`);
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: randomEmail,
                password: password
            }),
        });
        console.log('Register Status:', response.status);
        const data = await response.json();
        console.log('Register Data:', JSON.stringify(data, null, 2));

        if (data.success && data.data) {
            console.log('Token:', data.data.token ? 'Present' : 'Missing');
            console.log('User Object:', JSON.stringify(data.data.user, null, 2));
            if (data.data.user) {
                console.log('User Id from object:', data.data.user.id);
            }
        }

    } catch (error) {
        console.error('Request failed:', error);
    }
}

testLogin();
