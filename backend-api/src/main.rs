use std::{env, sync::Arc};

use anyhow::Context;
use axum::{routing::get, Router};
use tokio_postgres::NoTls;

mod debug;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Use localhost in dev. The container defaults this to `db`
    let host = env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string());

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

    let api_routes = Router::new()
        .route("/debug", get(debug::debug_handler))
        .with_state(Arc::new(client));

    let app = Router::new().nest("/api", api_routes);

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", 3000))
        .await
        .context("While binding to the port/address")?;
    axum::serve(listener, app).await.context("While serving")
}
