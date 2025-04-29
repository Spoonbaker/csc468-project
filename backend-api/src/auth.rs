use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Redirect},
    Json,
};
use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, ClientId, ClientSecret, RedirectUrl,
    TokenUrl, TokenResponse,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio_postgres::Client;
use urlencoding;

#[derive(Clone)]
pub struct AuthState {
    pub oauth_client: BasicClient,
    pub db_client: Arc<Client>,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub expires_in: i64,
}

pub fn init_oauth_client() -> anyhow::Result<BasicClient> {
    let client_id = std::env::var("GOOGLE_CLIENT_ID")
        .expect("GOOGLE_CLIENT_ID must be set");
    let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
        .expect("GOOGLE_CLIENT_SECRET must be set");
    let redirect_url = std::env::var("GOOGLE_REDIRECT_URL")
        .expect("GOOGLE_REDIRECT_URL must be set");

    let auth_url = AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())?;
    let token_url = TokenUrl::new("https://oauth2.googleapis.com/token".to_string())?;

    let client = BasicClient::new(
        ClientId::new(client_id),
        Some(ClientSecret::new(client_secret)),
        auth_url,
        Some(token_url),
    )
    .set_redirect_uri(RedirectUrl::new(redirect_url)?);

    Ok(client)
}

pub async fn google_auth_handler(State(state): State<AuthState>) -> impl IntoResponse {
    println!("Received request to /auth/google");
    let (auth_url, _csrf_token) = state
        .oauth_client
        .authorize_url(oauth2::CsrfToken::new_random)
        .add_scope(oauth2::Scope::new(
            "https://www.googleapis.com/auth/userinfo.email".to_string(),
        ))
        .add_scope(oauth2::Scope::new(
            "https://www.googleapis.com/auth/userinfo.profile".to_string(),
        ))
        .url();

    println!("Redirecting to Google auth URL: {}", auth_url.as_str());
    Redirect::to(auth_url.as_str())
}

#[derive(Deserialize)]
pub struct AuthCallbackQuery {
    code: String,
}

pub async fn google_auth_callback(
    State(state): State<AuthState>,
    query: axum::extract::Query<AuthCallbackQuery>,
) -> impl IntoResponse {
    // Handle all potential errors and return a redirect in each case
    let token = match process_oauth_callback(state, query).await {
        Ok(token) => token,
        Err(e) => {
            // Redirect back to frontend with error
            return Redirect::to(&format!("http://localhost:8081/?error={}", urlencoding::encode(&e.1)));
        }
    };

    // Successful case - redirect with token
    let redirect_url = format!("http://localhost:8081/?token={}&expires_in=3600#auth-callback", token);
    Redirect::to(&redirect_url)
}

// Helper function to process the OAuth callback and return a Result
async fn process_oauth_callback(
    state: AuthState,
    query: axum::extract::Query<AuthCallbackQuery>,
) -> Result<String, (StatusCode, String)> {
    let token_result = state
        .oauth_client
        .exchange_code(oauth2::AuthorizationCode::new(query.code.clone()))
        .request_async(async_http_client)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Get user info from Google
    let client = reqwest::Client::new();
    let user_info: serde_json::Value = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(token_result.access_token().secret())
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let email = user_info["email"]
        .as_str()
        .ok_or_else(|| (StatusCode::BAD_REQUEST, "No email in user info".to_string()))?;

    // Create or get user in database
    let user_id = state
        .db_client
        .query_one(
            "INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO UPDATE SET email = $1 RETURNING id",
            &[&email],
        )
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .get::<_, i32>(0);

    // Generate JWT token
    let token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &serde_json::json!({
            "sub": user_id,
            "exp": chrono::Utc::now().timestamp() + 3600, // 1 hour expiry
        }),
        &jsonwebtoken::EncodingKey::from_secret(
            std::env::var("JWT_SECRET")
                .expect("JWT_SECRET must be set")
                .as_bytes(),
        ),
    )
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(token)
} 