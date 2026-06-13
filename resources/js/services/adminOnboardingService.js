import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api'

/**
 * Build axios headers with bearer token.
 */
function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

/**
 * Wrap axios calls to normalise 403 / 422 errors.
 */
async function apiPost(url, body, token) {
  try {
    const response = await axios.post(url, body, { headers: authHeaders(token) })
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
      err.validationErrors = error.response.data?.errors ?? {}
      throw err
    }

    throw error
  }
}

/**
 * Submit the Super Admin salon onboarding form to the single backend endpoint.
 *
 * @param {Object} payload  - { salon, branch, owner, service_products }
 * @param {string} token    - Bearer token from the auth store
 * @returns {Promise<Object>} Response from the onboarding API
 */
export async function submitOnboarding(payload, token) {
  const body = {
    saloon: {
      business_name: payload.salon?.business_name,
      payment_type: payload.salon?.payment_type,
      payment_amount: Number(payload.salon?.amount),
      transaction_id: payload.salon?.transaction_id,
      is_active: payload.salon?.active ?? true,
      referral_code: payload.salon?.referral_code || null,
    },
    branch: {
      branch_name: payload.branch?.name,
      business_address_1: payload.branch?.address_line_1,
      business_address_2: payload.branch?.address_line_2 || null,
      city: payload.branch?.city,
      state: payload.branch?.state,
      area_pincode: payload.branch?.pincode,
      country: payload.branch?.country || 'India',
      is_active: payload.branch?.active ?? true,
    },
    user: {
      firstname: payload.owner?.first_name,
      lastname: payload.owner?.last_name,
      email: payload.owner?.email,
      phone: payload.owner?.phone,
      password: payload.owner?.password || undefined,
      password_confirmation: payload.owner?.password || undefined,
      is_active: payload.owner?.active ?? true,
    },
    service_products: (payload.service_products ?? []).map(sp => ({
      service_name: sp.service,
      product_name: sp.product,
      price: Number(sp.price),
      duration_minutes: Number(sp.duration),
      is_active: sp.active ?? true,
    }))
  }

  return await apiPost(`${API_BASE_URL}/v1/admin/onboarding`, body, token)
}
