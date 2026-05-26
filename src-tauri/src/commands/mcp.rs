use tauri::State;

use crate::db::{self, DbPool, McpServer, McpServerInstallation};
use crate::AppState;

// ─── Core Implementations (testable without Tauri State) ──────────────────────

/// Create a new MCP server configuration.
pub async fn create_mcp_server_impl(
    pool: &DbPool,
    id: &str,
    name: &str,
    command: &str,
    args: &[String],
    env: Option<&serde_json::Value>,
    cwd: Option<&str>,
) -> Result<McpServer, String> {
    db::create_mcp_server(pool, id, name, command, args, env, cwd).await
}

/// Retrieve all MCP servers.
pub async fn get_all_mcp_servers_impl(pool: &DbPool) -> Result<Vec<McpServer>, String> {
    db::get_all_mcp_servers(pool).await
}

/// Retrieve an MCP server by ID.
pub async fn get_mcp_server_by_id_impl(pool: &DbPool, id: &str) -> Result<Option<McpServer>, String> {
    db::get_mcp_server_by_id(pool, id).await
}

/// Update an MCP server configuration.
pub async fn update_mcp_server_impl(
    pool: &DbPool,
    id: &str,
    name: &str,
    command: &str,
    args: &[String],
    env: Option<&serde_json::Value>,
    cwd: Option<&str>,
) -> Result<McpServer, String> {
    db::update_mcp_server(pool, id, name, command, args, env, cwd).await
}

/// Delete an MCP server.
pub async fn delete_mcp_server_impl(pool: &DbPool, id: &str) -> Result<(), String> {
    db::delete_mcp_server(pool, id).await
}

/// Install an MCP server to an agent.
pub async fn install_mcp_server_to_agent_impl(
    pool: &DbPool,
    server_id: &str,
    agent_id: &str,
) -> Result<McpServerInstallation, String> {
    db::install_mcp_server_to_agent(pool, server_id, agent_id).await
}

/// Uninstall an MCP server from an agent.
pub async fn uninstall_mcp_server_from_agent_impl(
    pool: &DbPool,
    server_id: &str,
    agent_id: &str,
) -> Result<(), String> {
    db::uninstall_mcp_server_from_agent(pool, server_id, agent_id).await
}

/// Retrieve all MCP servers installed to an agent.
pub async fn get_mcp_servers_for_agent_impl(pool: &DbPool, agent_id: &str) -> Result<Vec<McpServer>, String> {
    db::get_mcp_servers_for_agent(pool, agent_id).await
}

/// Retrieve all agents an MCP server is installed to.
pub async fn get_agents_for_mcp_server_impl(pool: &DbPool, server_id: &str) -> Result<Vec<String>, String> {
    db::get_agents_for_mcp_server(pool, server_id).await
}

/// Check if an MCP server is installed to an agent.
pub async fn is_mcp_server_installed_to_agent_impl(pool: &DbPool, server_id: &str, agent_id: &str) -> Result<bool, String> {
    db::is_mcp_server_installed_to_agent(pool, server_id, agent_id).await
}

/// Batch install an MCP server to multiple agents.
pub async fn batch_install_mcp_server_to_agents_impl(
    pool: &DbPool,
    server_id: &str,
    agent_ids: &[String],
) -> Result<Vec<McpServerInstallation>, String> {
    let mut installations = Vec::new();
    for agent_id in agent_ids {
        let installation = db::install_mcp_server_to_agent(pool, server_id, agent_id).await?;
        installations.push(installation);
    }
    Ok(installations)
}

/// Batch uninstall an MCP server from multiple agents.
pub async fn batch_uninstall_mcp_server_from_agents_impl(
    pool: &DbPool,
    server_id: &str,
    agent_ids: &[String],
) -> Result<(), String> {
    for agent_id in agent_ids {
        db::uninstall_mcp_server_from_agent(pool, server_id, agent_id).await?;
    }
    Ok(())
}

// ─── Tauri Commands ───────────────────────────────────────────────────────────

/// Tauri command: create a new MCP server.
#[tauri::command]
pub async fn create_mcp_server(
    state: State<'_, AppState>,
    id: String,
    name: String,
    command: String,
    args: Vec<String>,
    env: Option<serde_json::Value>,
    cwd: Option<String>,
) -> Result<McpServer, String> {
    create_mcp_server_impl(&state.db, &id, &name, &command, &args, env.as_ref(), cwd.as_deref()).await
}

/// Tauri command: retrieve all MCP servers.
#[tauri::command]
pub async fn get_all_mcp_servers(state: State<'_, AppState>) -> Result<Vec<McpServer>, String> {
    get_all_mcp_servers_impl(&state.db).await
}

/// Tauri command: retrieve an MCP server by ID.
#[tauri::command]
pub async fn get_mcp_server_by_id(state: State<'_, AppState>, id: String) -> Result<Option<McpServer>, String> {
    get_mcp_server_by_id_impl(&state.db, &id).await
}

/// Tauri command: update an MCP server.
#[tauri::command]
pub async fn update_mcp_server(
    state: State<'_, AppState>,
    id: String,
    name: String,
    command: String,
    args: Vec<String>,
    env: Option<serde_json::Value>,
    cwd: Option<String>,
) -> Result<McpServer, String> {
    update_mcp_server_impl(&state.db, &id, &name, &command, &args, env.as_ref(), cwd.as_deref()).await
}

/// Tauri command: delete an MCP server.
#[tauri::command]
pub async fn delete_mcp_server(state: State<'_, AppState>, id: String) -> Result<(), String> {
    delete_mcp_server_impl(&state.db, &id).await
}

/// Tauri command: install an MCP server to an agent.
#[tauri::command]
pub async fn install_mcp_server_to_agent(
    state: State<'_, AppState>,
    server_id: String,
    agent_id: String,
) -> Result<McpServerInstallation, String> {
    install_mcp_server_to_agent_impl(&state.db, &server_id, &agent_id).await
}

/// Tauri command: uninstall an MCP server from an agent.
#[tauri::command]
pub async fn uninstall_mcp_server_from_agent(
    state: State<'_, AppState>,
    server_id: String,
    agent_id: String,
) -> Result<(), String> {
    uninstall_mcp_server_from_agent_impl(&state.db, &server_id, &agent_id).await
}

/// Tauri command: retrieve all MCP servers installed to an agent.
#[tauri::command]
pub async fn get_mcp_servers_for_agent(state: State<'_, AppState>, agent_id: String) -> Result<Vec<McpServer>, String> {
    get_mcp_servers_for_agent_impl(&state.db, &agent_id).await
}

/// Tauri command: retrieve all agents an MCP server is installed to.
#[tauri::command]
pub async fn get_agents_for_mcp_server(state: State<'_, AppState>, server_id: String) -> Result<Vec<String>, String> {
    get_agents_for_mcp_server_impl(&state.db, &server_id).await
}

/// Tauri command: check if an MCP server is installed to an agent.
#[tauri::command]
pub async fn is_mcp_server_installed_to_agent(
    state: State<'_, AppState>,
    server_id: String,
    agent_id: String,
) -> Result<bool, String> {
    is_mcp_server_installed_to_agent_impl(&state.db, &server_id, &agent_id).await
}

/// Tauri command: batch install an MCP server to multiple agents.
#[tauri::command]
pub async fn batch_install_mcp_server_to_agents(
    state: State<'_, AppState>,
    server_id: String,
    agent_ids: Vec<String>,
) -> Result<Vec<McpServerInstallation>, String> {
    batch_install_mcp_server_to_agents_impl(&state.db, &server_id, &agent_ids).await
}

/// Tauri command: batch uninstall an MCP server from multiple agents.
#[tauri::command]
pub async fn batch_uninstall_mcp_server_from_agents(
    state: State<'_, AppState>,
    server_id: String,
    agent_ids: Vec<String>,
) -> Result<(), String> {
    batch_uninstall_mcp_server_from_agents_impl(&state.db, &server_id, &agent_ids).await
}