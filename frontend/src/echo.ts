// frontend/src/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

console.log('Pusher Configuration:', {
    key_exists: !!import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER
});

const EchoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true, // Always use TLS for Pusher Channels
});

export default EchoInstance;
