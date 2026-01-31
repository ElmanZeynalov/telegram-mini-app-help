
async function testTrack() {
    try {
        const response = await fetch('http://localhost:3000/api/analytics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventType: 'test_event',
                telegramId: '123456789',
                firstName: 'Test',
                lastName: 'User',
                metadata: {
                    source: 'reproduction_script'
                }
            })
        });

        try {
            const data = await response.json();
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Status:', response.status);
            console.log('Body:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testTrack();
