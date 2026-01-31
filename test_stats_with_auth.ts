
import { encrypt } from './src/lib/auth';
import { cookies } from 'next/headers'; // This might fail in standalone script
// Actually, I can't import 'next/headers' in a standalone script easily.

// Instead, I'll essentially copy the encryption logic or just use the encrypt function if it doesn't use next/headers.
// src/lib/auth.ts: encrypt uses 'jose' only. It does NOT use next/headers.
// Only `getSession`, `login`, `logout` use next/headers.

async function testStatsWithAuth() {
    try {
        // Create valid session payload
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const sessionPayload = {
            user: {
                id: 'test-admin',
                email: 'admin@example.com',
                role: 'admin'
            },
            expires
        };

        // Encrypt token
        const token = await encrypt(sessionPayload);
        console.log("Generated Token:", token);

        // Make request with cookie
        const response = await fetch('http://localhost:3000/api/analytics/stats?period=7d&language=all', {
            method: 'GET',
            headers: {
                'Cookie': `admin_session=${token}`
            }
        });

        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data keys:', Object.keys(data));
        } else {
            console.log('Failed:', await response.text());
        }

    } catch (e) {
        console.error("Test Error:", e);
    }
}

testStatsWithAuth();
