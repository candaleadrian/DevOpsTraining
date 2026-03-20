# ACR name must be globally unique, alphanumeric only
resource "azurerm_container_registry" "main" {
  name                = replace("acr${var.resource_prefix}", "-", "")
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  admin_enabled       = true
  tags                = var.tags
}
