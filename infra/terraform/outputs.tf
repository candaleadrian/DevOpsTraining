output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "container_registry_login_server" {
  description = "ACR login server URL"
  value       = module.container_registry.login_server
}

output "backend_url" {
  description = "Backend Container App FQDN"
  value       = module.container_apps.backend_fqdn
}

output "frontend_url" {
  description = "Frontend Container App FQDN"
  value       = module.container_apps.frontend_fqdn
}

output "database_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = module.database.server_fqdn
}

output "appinsights_connection_string" {
  description = "Application Insights connection string"
  value       = module.monitoring.appinsights_connection_string
  sensitive   = true
}
