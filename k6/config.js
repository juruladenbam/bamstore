export const config = {
    dev: {
        baseUrl: 'http://127.0.0.1:8000/api', // Local Laravel backend
    },
    prod: {
        baseUrl: 'https://apistore.bamseribuputu.my.id/api', // Update this with your actual production URL
    },
};

export function getBaseUrl() {
    const env = __ENV.ENV || 'dev';
    return config[env].baseUrl;
}
