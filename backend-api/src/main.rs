use std::{env, sync::Arc};

use anyhow::Context;
use axum::{
    routing::get,
    Router,
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
};
use tokio_postgres::NoTls;
use tower_http::cors::CorsLayer;

mod debug;
mod auth;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load environment variables
    dotenv::dotenv().ok();

    // Use localhost in dev. The container defaults this to `db`
    let host = env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string());

    // 3000 for dev, container defaults to 80
    let listen_port = env::var_os("LISTEN_PORT")
        .unwrap_or_else(|| "3000".into())
        .to_str()
        .and_then(|x| x.parse::<u16>().ok())
        .context("While parsing $LISTEN_PORT")?;

    let (client, connection) = tokio_postgres::Config::new()
        .application_name("backend-api")
        .user("nobody")
        .dbname("postgres") // Username & DB name are fixed
        .host(host)
        .connect(NoTls)
        .await
        .context("While opening Postgres Connection")?;

    // The connection object performs the actual communication with the database,
    // so spawn it off to run on its own.
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    // Initialize OAuth client
    let oauth_client = auth::init_oauth_client()?;

    // Wrap the client in an Arc first
    let client = Arc::new(client);

    // Create shared state
    let state = auth::AuthState {
        oauth_client,
        db_client: client.clone(),
    };

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:8081".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
        .allow_credentials(true);

    // Create two separate routers with different state types
    let auth_routes = Router::new()
        .route("/auth/google", get(auth::google_auth_handler))
        .route("/auth/google/callback", get(auth::google_auth_callback))
        .with_state(state);

    let debug_routes = Router::new()
        .route("/debug", get(debug::debug_handler))
        .with_state(client);

    // Merge the routers
    let api_routes = auth_routes.merge(debug_routes);

    println!("Setting up routes under /api/v0");
    let app = Router::new()
        .nest("/api/v0", api_routes)
        .layer(cors);

    println!("Starting server on port {}", listen_port);
    let listener = tokio::net::TcpListener::bind(("0.0.0.0", listen_port))
        .await
        .context("While binding to the port/address")?;
    axum::serve(listener, app).await.context("While serving")
}
