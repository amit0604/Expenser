use std::{env, net::SocketAddr};

use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct Config {
    pub bind_addr: SocketAddr,
    pub database_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_owned());
        let port = env::var("PORT").unwrap_or_else(|_| "8081".to_owned());
        let bind_addr = format!("{host}:{port}")
            .parse()
            .with_context(|| format!("invalid HOST/PORT combination: {host}:{port}"))?;

        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://expenser:expenser@127.0.0.1:5432/expenser".to_owned());

        Ok(Self {
            bind_addr,
            database_url,
        })
    }
}
