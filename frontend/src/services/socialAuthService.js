import axios from 'axios'
import { api } from './authService'

// Social auth service for OAuth login
export const socialAuthService = {
  // Get redirect URL for provider
  async getRedirectUrl(provider) {
    const response = await api.get(`/social/redirect/${provider}`)
    return response.data.data.redirect_url
  },

  // Handle OAuth callback
  async handleCallback(provider, code) {
    // For stateless OAuth, we typically redirect to the callback URL
    // and let the backend handle it. This method is for reference.
    const response = await api.get(`/social/callback/${provider}?code=${code}`)
    return response.data
  },

  // Get connected social accounts
  async getConnectedAccounts() {
    const response = await api.get('/social/connected')
    return response.data.data
  },

  // Disconnect a social account
  async disconnect(provider) {
    const response = await api.delete(`/social/disconnect/${provider}`)
    return response.data
  },

  // Initiate social login from frontend (opens popup)
  async loginWithProvider(provider) {
    try {
      // Get redirect URL from backend
      const redirectUrl = await this.getRedirectUrl(provider)

      // Open OAuth popup
      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popup = window.open(
        redirectUrl,
        `${provider}_login`,
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,resizable=yes,scrollbars=yes`
      )

      // Return popup reference for tracking
      return popup
    } catch (error) {
      console.error('Failed to initiate social login:', error)
      throw error
    }
  }
}
