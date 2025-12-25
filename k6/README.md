# BamStore K6 Load Testing

This directory contains load testing scripts using [k6](https://k6.io/).

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed on your machine.

## Configuration

The configuration is located in `k6/config.js`.
**IMPORTANT:** update `prod.baseUrl` in `config.js` with your actual production URL before running tests against production.

## Running Tests

### Development Environment
To run tests against your local Laravel backend (assumed running at `http://127.0.0.1:8000`):

```bash
k6 run -e ENV=dev k6/script.js
```

### Production Environment
To run tests against your production environment (shared hosting):

**CAUTION:** Ensure you are authorized to load test the production server. Start with low load to avoid affecting real users.

```bash
k6 run -e ENV=prod k6/script.js
```

## Scenarios
The current script tests the following public API endpoints:
- `GET /api/products`
- `GET /api/categories`
- `GET /api/settings`
