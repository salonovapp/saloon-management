<?php

namespace App\Services\Notifications;

use App\Contracts\Notifications\EmailOtpSenderInterface;
use App\Contracts\Notifications\OtpNotificationServiceInterface;
use App\Contracts\Notifications\SmsOtpSenderInterface;
use InvalidArgumentException;

class OtpNotificationService implements OtpNotificationServiceInterface
{
    public function __construct(
        private readonly EmailOtpSenderInterface $emailSender,
        private readonly SmsOtpSenderInterface $smsSender,
    ) {}

    public function sendPasswordResetOtp(string $channel, string $destination, string $code): void
    {
        $expiryMinutes = (int) config('otp.expiry_minutes', 10);
        $message = sprintf(
            'Your password reset OTP is %s. It will expire in %d minutes.',
            $code,
            $expiryMinutes,
        );

        match ($channel) {
            'email' => $this->emailSender->send(
                $destination,
                'Password reset OTP',
                $message,
            ),
            'sms' => $this->smsSender->send($destination, $message),
            default => throw new InvalidArgumentException('Unsupported OTP channel.'),
        };
    }
}
