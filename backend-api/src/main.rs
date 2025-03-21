use std::{env, sync::Arc};

use anyhow::Context;
use axum::{routing::get, Router};
use tokio_postgres::NoTls;

mod debug;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
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

    let api_routes = Router::new()
        .route("/debug", get(debug::debug_handler))
        .with_state(Arc::new(client));

    let app = Router::new().nest("/api", api_routes);

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", listen_port))
        .await
        .context("While binding to the port/address")?;
    axum::serve(listener, app).await.context("While serving")
}
