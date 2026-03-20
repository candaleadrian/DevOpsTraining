output "vnet_id" {
  description = "Virtual network ID"
  value       = azurerm_virtual_network.main.id
}

output "container_apps_subnet_id" {
  description = "Container Apps subnet ID"
  value       = azurerm_subnet.container_apps.id
}

output "database_subnet_id" {
  description = "Database subnet ID"
  value       = azurerm_subnet.database.id
}

output "postgres_private_dns_zone_id" {
  description = "Private DNS zone ID for PostgreSQL"
  value       = azurerm_private_dns_zone.postgres.id
}
