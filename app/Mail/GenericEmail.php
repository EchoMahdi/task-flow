<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Generic email mailable for sending transactional emails.
 * 
 * Usage:
 * $mailable = (new GenericEmail('Subject'))->html('<p>Content</p>');
 * Mail::to($user)->send($mailable);
 */
class GenericEmail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Build the message.
     */
    public function build(): self
    {
        return $this;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                config('mail.from.address', 'noreply@example.com'),
                config('mail.from.name', 'System')
            ),
        );
    }
}
