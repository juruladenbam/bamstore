import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl } from './config.js';

export const options = {
    stages: [
        { duration: '30s', target: 10 }, // Ramp up to 20 users over 30 seconds
        { duration: '1m', target: 10 },  // Stay at 20 users for 1 minute
        { duration: '10s', target: 0 },  // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    },
};

export default function () {
    const BASE_URL = getBaseUrl();

    // Test 1: Get Products
    const resProducts = http.get(`${BASE_URL}/products`);
    check(resProducts, {
        'products status is 200': (r) => r.status === 200,
        'products duration < 500ms': (r) => r.timings.duration < 500,
    });

    // Test 2: Get Categories
    const resCategories = http.get(`${BASE_URL}/categories`);
    check(resCategories, {
        'categories status is 200': (r) => r.status === 200,
    });

    // Test 3: Get Settings
    const resSettings = http.get(`${BASE_URL}/settings`);
    check(resSettings, {
        'settings status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
