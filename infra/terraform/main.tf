# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.resource_prefix}"
  location = var.location
  tags     = local.common_tags
}

# Networking
module "network" {
  source = "./modules/network"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  resource_prefix     = local.resource_prefix
  tags                = local.common_tags
}

# Container Registry
module "container_registry" {
  source = "./modules/container_registry"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  resource_prefix     = local.resource_prefix
  tags                = local.common_tags
}

# PostgreSQL Database
module "database" {
  source = "./modules/database"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  resource_prefix     = local.resource_prefix
  subnet_id           = module.network.database_subnet_id
  private_dns_zone_id = module.network.postgres_private_dns_zone_id
  admin_username      = var.db_admin_username
  admin_password      = var.db_admin_password
  tags                = local.common_tags

  depends_on = [module.network]
}

# # Monitoring (Log Analytics + Application Insights)
# module "monitoring" {
#   source = "./modules/monitoring"

#   resource_group_name = azurerm_resource_group.main.name
#   location            = azurerm_resource_group.main.location
#   resource_prefix     = local.resource_prefix
#   tags                = local.common_tags
# }

# # Container Apps (Backend + Frontend)
# module "container_apps" {
#   source = "./modules/container_apps"

#   resource_group_name                = azurerm_resource_group.main.name
#   location                           = azurerm_resource_group.main.location
#   resource_prefix                    = local.resource_prefix
#   subnet_id                          = module.network.container_apps_subnet_id
#   log_analytics_workspace_id         = module.monitoring.log_analytics_workspace_id
#   container_registry_login_server    = module.container_registry.login_server
#   container_registry_admin_username  = module.container_registry.admin_username
#   container_registry_admin_password  = module.container_registry.admin_password
#   database_url                       = module.database.connection_string
#   appinsights_connection_string      = module.monitoring.appinsights_connection_string
#   tags                               = local.common_tags
# }
