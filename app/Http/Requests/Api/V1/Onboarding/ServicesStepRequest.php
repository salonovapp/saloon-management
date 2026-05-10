<?php

namespace App\Http\Requests\Api\V1\Onboarding;

use Illuminate\Foundation\Http\FormRequest;

class ServicesStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc,dns', 'exists:users,email'],
            'skipped' => ['required', 'boolean'],
            'services' => ['required', 'array', 'max:5'],
            'services.*.name' => ['exclude_if:skipped,true', 'required', 'string', 'max:120'],
            'services.*.category' => ['exclude_if:skipped,true', 'required', 'string', 'max:60'],
            'services.*.duration' => ['exclude_if:skipped,true', 'required', 'integer', 'min:15', 'max:240'],
            'services.*.price' => ['exclude_if:skipped,true', 'required', 'numeric', 'min:0'],
            'services.*.bufferTime' => ['exclude_if:skipped,true', 'required', 'integer', 'in:0,5,10,15'],
        ];
    }
}
