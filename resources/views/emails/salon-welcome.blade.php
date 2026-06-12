<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome to SalonOS</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
    <p>Hi {{ $userName }},</p>

    <p>
        Your salon <strong>{{ $salonName }}</strong> has been set up on SalonOS.
        You can sign in with your email address and start managing your salon.
    </p>

    <p>
        <strong>Login email:</strong> {{ $email }}<br>
        <a href="{{ $loginUrl }}" style="color: #2563eb;">Sign in to SalonOS</a>
    </p>

    <p>If you did not expect this email, please contact support.</p>

    <p>— The SalonOS Team</p>
</body>
</html>
