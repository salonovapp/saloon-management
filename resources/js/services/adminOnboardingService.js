import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

/**
 * Submit the Super Admin salon onboarding form.
 *
 * @param {import('../types/onboarding').OnboardingPayload} payload
 * @param {string} token - Bearer token from the auth store
 * @returns {Promise<import('../types/onboarding').OnboardingResponse>}
 * @throws {{ forbidden: true }} on 403
 * @throws {{ validationErrors: import('../types/onboarding').ValidationErrors }} on 422
 * @throws {Error} on other failures
 */
export async function submitOnboarding(payload, token) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/v1/admin/onboarding`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data?.data ?? response.data
  } catch (error) {
    const status = error?.response?.status

    if (status === 403) {
      const err = new Error('Forbidden')
      err.forbidden = true
      throw err
    }

    if (status === 422) {
      const err = new Error('Validation failed')
      // Backend returns { errors: { "owner.email": ["…"], … } }
      err.validationErrors = error.response.data?.errors ?? {}
      throw err
    }

    throw error
  }
}
