import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl } from './config.js';

export const options = {
    scenarios: {
        checkout_race: {
            executor: 'per-vu-iterations',
            vus: 10, // 10 concurrent users
            iterations: 1, // Each tries to buy once immediately
            maxDuration: '30s',
        },
    },
};

export default function () {
    const BASE_URL = getBaseUrl();

    // NOTE: You must update these IDs to match valid products in your DB
    // Ideally, setup a product with stock = 5, and run this with 10 VUs.
    // 5 requests should succeed, 5 should fail with 500 or validation error.
    const payload = JSON.stringify({
        checkout_name: `User ${__VU}`,
        phone_number: `08123456789${__VU}`,
        qobilah: 'Tester Group',
        payment_method: 'transfer',
        items: [
            {
                product_id: 1, // UPDATE THIS
                quantity: 1,
                recipient_name: `Recipient ${__VU}`,
                // variant_ids: [], // Add variant IDs if needed
            }
        ]
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    const res = http.post(`${BASE_URL}/checkout`, payload, params);

    // We accept 201 (Success) or 500 (Sold out/Race condition blocked)
    // We just want to make sure we don't get negative stock on the server side.
    console.log(`VU ${__VU} status: ${res.status}`);
}
