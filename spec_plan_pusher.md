## Goal
Implement real-time notifications within the Admin Panel (ReactJS) to immediately alert administrators whenever a new order is successfully recorded in the database (Laravel), eliminating the need for manual page refreshes.

## Proposed Solution
Utilize a third-party Pusher Channels (or similar WebSocket-as-a-Service) solution to bridge real-time communication between the Laravel backend and the ReactJS frontend. This approach is necessary due to the constraints of the shared hosting environment (no SSH/terminal access), which prevents running a dedicated WebSocket server (like Reverb or Socket.io).

## Tasks
- Backend Setup (Laravel)
1. [ ] Pusher Installation & Configuration: Install pusher/pusher-php-server and configure Pusher credentials (App ID, Key, Secret) in the .env file and config/broadcasting.php.
2. [ ] Broadcasting Driver: Ensure the broadcasting driver in config/broadcasting.php is set to pusher.
3. [ ] Event Creation: Create a new Laravel Event (e.g., NewOrderReceived) that implements the Illuminate\Contracts\Broadcasting\ShouldBroadcast interface.
4. [ ] Implement Event Trigger: Modify the logic where new orders are processed (e.g., Controller or Service) to dispatch the event using broadcast(new NewOrderReceived($order)).
5. [ ] Queue Configuration (Optional): [Inferensi] Investigate available queue drivers supported by Rumahweb Shared Hosting (e.g., database or sync) to optimize broadcasting performance, if possible.

- Frontend Setup (ReactJS)
1. [ ] Dependency Installation: Install the necessary npm packages: laravel-echo and pusher-js.
2. [ ] Echo Configuration: Initialize LaravelEcho in the React application's entry point (e.g., index.js or App.js) using the configured Pusher details.
3. [ ] Channel Listening: Implement a listener in the relevant Admin Panel component (e.g., the main Dashboard) to subscribe to the correct channel and listen for the NewOrderReceived event.
4. [ ] Notification Display: Implement a clear visual notification mechanism (e.g., a toast message, a dynamic badge counter, or a sound alert) when the event is successfully received.

## Notes & Constraints
- The Pusher Channels service is mandatory to bypass the lack of SSH access on shared hosting.
- Confirmation is needed on the queue configuration in the Rumahweb environment. If asynchronous queues are not supported, broadcasting will run synchronously, but the core real-time functionality should still work.
- Ensure all sensitive keys are stored securely in environment variables.