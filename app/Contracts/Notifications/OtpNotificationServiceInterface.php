<?php

namespace App\Contracts\Notifications;

interface OtpNotificationServiceInterface
{
    public function sendPasswordResetOtp(string $channel, string $destination, string $code): void;
}
