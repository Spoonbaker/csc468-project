use std::sync::Arc;

use axum::{extract::State, Json};
use serde::Serialize;
use tokio_postgres::Client;

#[derive(Serialize)]
pub struct DebugInfo {
    db_version: String,
}

pub async fn debug_handler(State(client): State<Arc<Client>>) -> Json<DebugInfo> {
    let db_version = client
        .query_one("SELECT version()", &[])
        .await
        .unwrap()
        .get(0);
    Json(DebugInfo { db_version })
}
