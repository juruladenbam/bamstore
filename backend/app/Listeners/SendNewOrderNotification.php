<?php

namespace App\Listeners;

use App\Events\NewOrderReceived;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class SendNewOrderNotification
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NewOrderReceived $event): void
    {
        // Send notification to all admins
        // For now, we assume all users are admins or we pick the first one
        $admins = User::all();

        Notification::send($admins, new NewOrderNotification($event->order));
    }
}
