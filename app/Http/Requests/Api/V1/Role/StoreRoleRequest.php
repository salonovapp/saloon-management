<?php

namespace App\Http\Requests\Api\V1\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->filled('name') ? trim((string) $this->input('name')) : null,
        ]);
    }

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
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('roles', 'name')->where(
                    fn ($query) => $query->where('saloon_id', $this->input('saloon_id')),
                ),
            ],
            'is_active' => ['required', 'boolean'],
            'saloon_id' => ['nullable', 'integer', 'exists:saloons,id'],
        ];
    }
}
