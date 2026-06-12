<?php

namespace App\Http\Requests\Api\V1\Saloon;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSaloonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_system_admin;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('business_name')) {
            $this->merge([
                'business_name' => trim((string) $this->input('business_name')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var \App\Models\Saloon|null $saloon */
        $saloon = $this->route('saloon');

        return [
            'business_name' => ['required', 'string', 'max:120'],
            'payment_type' => ['required', 'string', Rule::in(['online', 'cash', 'card', 'upi', 'bank_transfer', 'other'])],
            'payment_amount' => ['required', 'numeric', 'min:0'],
            'transaction_id' => ['nullable', 'string', 'max:120'],
            'is_active' => ['required', 'boolean'],
            'referral_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('saloons', 'referral_code')->ignore($saloon?->id),
            ],
        ];
    }
}
