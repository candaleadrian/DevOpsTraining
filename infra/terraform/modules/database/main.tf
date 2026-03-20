resource "azurerm_postgresql_flexible_server" "main" {
  name                          = "psql-${var.resource_prefix}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  version                       = "15"
  delegated_subnet_id           = var.subnet_id
  private_dns_zone_id           = var.private_dns_zone_id
  administrator_login           = var.admin_username
  administrator_password        = var.admin_password
  sku_name                      = var.sku_name
  storage_mb                    = var.storage_mb
  backup_retention_days         = 7
  geo_redundant_backup_enabled  = false
  public_network_access_enabled = false
  zone                          = "1"
  tags                          = var.tags

  lifecycle {
    prevent_destroy = false
  }
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = "proximity_alarm"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}
