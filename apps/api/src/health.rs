use std::time::Duration;

use axum::{Json, extract::State, http::StatusCode};
use serde::Serialize;

use crate::AppState;

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
    pub service: &'static str,
    pub version: &'static str,
}

pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "expenser-api",
        version: env!("CARGO_PKG_VERSION"),
    })
}

#[derive(Debug, Serialize)]
pub struct ReadyResponse {
    pub status: &'static str,
    pub database: &'static str,
}

pub async fn ready(State(state): State<AppState>) -> (StatusCode, Json<ReadyResponse>) {
    let result = tokio::time::timeout(
        Duration::from_secs(2),
        sqlx::query_scalar::<_, i32>("SELECT 1::int4").fetch_one(&state.db),
    )
    .await;

    match result {
        Ok(Ok(_)) => (
            StatusCode::OK,
            Json(ReadyResponse {
                status: "ready",
                database: "up",
            }),
        ),
        Ok(Err(error)) => {
            tracing::warn!(%error, "database readiness check failed");
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(ReadyResponse {
                    status: "not_ready",
                    database: "down",
                }),
            )
        }
        Err(_) => {
            tracing::warn!("database readiness check timed out");
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(ReadyResponse {
                    status: "not_ready",
                    database: "timeout",
                }),
            )
        }
    }
}
