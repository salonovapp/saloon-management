<?php

namespace App\Providers;

use App\Contracts\Notifications\EmailOtpSenderInterface;
use App\Contracts\Notifications\OtpNotificationServiceInterface;
use App\Contracts\Notifications\SmsOtpSenderInterface;
use App\Repositories\Contracts\SaloonRepositoryInterface;
use App\Repositories\Contracts\SaloonServiceRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\SaloonRepository;
use App\Repositories\Eloquent\SaloonServiceRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Services\Notifications\AwsSesEmailOtpSender;
use App\Services\Notifications\AwsSnsSmsOtpSender;
use App\Services\Notifications\LogEmailOtpSender;
use App\Services\Notifications\LogSmsOtpSender;
use App\Services\Notifications\OtpNotificationService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(SaloonRepositoryInterface::class, SaloonRepository::class);
        $this->app->bind(SaloonServiceRepositoryInterface::class, SaloonServiceRepository::class);
        $this->app->bind(EmailOtpSenderInterface::class, function () {
            return match (config('otp.channels.email.driver', 'log')) {
                'aws' => new AwsSesEmailOtpSender(config('otp.aws', [])),
                default => new LogEmailOtpSender,
            };
        });
        $this->app->bind(SmsOtpSenderInterface::class, function () {
            return match (config('otp.channels.sms.driver', 'log')) {
                'aws' => new AwsSnsSmsOtpSender([
                    ...config('otp.aws', []),
                    'channels' => config('otp.channels', []),
                ]),
                default => new LogSmsOtpSender,
            };
        });
        $this->app->bind(OtpNotificationServiceInterface::class, OtpNotificationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
