@component('mail::message')
{{-- Greeting --}}
@if(!empty($userName))
# Hello {{ $userName }},
@else
# Hello!
@endif

{{-- Introduction --}}
{{-- This is a friendly reminder about your upcoming task --}}
You have a task that's due soon!

{{-- Task Details --}}
@component('mail::panel')
## {{ $taskTitle }}

@if(!empty($taskDescription))
**Description:** {{ $taskDescription }}
@endif

**Due Date:** {{ $dueDate ? \Carbon\Carbon::parse($dueDate)->format('l, F j, Y \a\t g:i A') : 'Not set' }}

**Reminder:** This task is due {{ $reminderText }}.
@endcomponent

{{-- Call to Action --}}
@component('mail::button', ['url' => $taskUrl, 'color' => 'primary'])
View Task
@endcomponent

{{-- Additional Information --}}
@if($daysUntilDue === 0)
> ⚠️ **This task is due today!** Please make sure to complete it.
@elseif($daysUntilDue === 1)
> 📅 **This task is due tomorrow!** Make sure you're prepared.
@elseif($daysUntilDue <= 3)
> 📅 **This task is due in {{ $daysUntilDue }} days.** Plan accordingly.
@endif

{{-- Closing --}}
Thanks for using our Task Manager!

{{-- Subtext --}}
@slot('subcopy')
If you're having trouble viewing this task in your browser, copy and paste the following URL into your browser:
[{{ $taskUrl }}]({{ $taskUrl }})

This is an automated reminder from our Task Notification System. If you no longer wish to receive these notifications, you can manage your notification settings in your account preferences.
@endslot
@endcomponent
