<?php

namespace App\Http\Controllers\Api\V1\Onboarding;

use App\Actions\Onboarding\OnboardingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Onboarding\AccountStepRequest;
use App\Http\Requests\Api\V1\Onboarding\BranchStepRequest;
use App\Http\Requests\Api\V1\Onboarding\CompleteStepRequest;
use App\Http\Requests\Api\V1\Onboarding\ServicesStepRequest;
use App\Http\Resources\Api\V1\Common\MessageResponseResource;
use Illuminate\Http\JsonResponse;

class OnboardingController extends Controller
{
    public function __construct(
        private readonly OnboardingAction $onboardingAction,
    ) {
    }

    public function account(AccountStepRequest $request): JsonResponse
    {
        $this->onboardingAction->saveAccount($request->validated());

        return (new MessageResponseResource([
            'message' => 'Account step saved.',
        ]))->response();
    }

    public function branch(BranchStepRequest $request): JsonResponse
    {
        $this->onboardingAction->saveBranch($request->validated());

        return (new MessageResponseResource([
            'message' => 'Branch step saved.',
        ]))->response();
    }

    public function services(ServicesStepRequest $request): JsonResponse
    {
        $this->onboardingAction->saveServices($request->validated());

        return (new MessageResponseResource([
            'message' => 'Services step saved.',
        ]))->response();
    }

    public function complete(CompleteStepRequest $request): JsonResponse
    {
        $this->onboardingAction->complete($request->validated());

        return (new MessageResponseResource([
            'message' => 'Onboarding completed.',
        ]))->response();
    }
}
