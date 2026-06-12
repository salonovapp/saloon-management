<?php

namespace App\Mail;

use App\Models\Saloon;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SalonWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly Saloon $saloon,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to SalonOS — Your salon is ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.salon-welcome',
            with: [
                'userName' => trim("{$this->user->firstname} {$this->user->lastname}"),
                'salonName' => $this->saloon->name,
                'loginUrl' => rtrim((string) config('app.url'), '/') . '/login',
                'email' => $this->user->email,
            ],
        );
    }
}
