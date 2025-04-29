import { ApiClient } from './utils/api';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
        ApiClient.handleOAuthCallback(code)
            .then(() => {
                window.location.href = '/';
            })
            .catch(error => {
                console.error('OAuth callback failed:', error);
            });
    }

    const loginButton = document.getElementById('googleLoginBtn');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = '/api/v0/auth/google';
        });
    }
}); 