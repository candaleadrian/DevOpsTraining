# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                           = "cae-${var.resource_prefix}"
  location                       = var.location
  resource_group_name            = var.resource_group_name
  log_analytics_workspace_id     = var.log_analytics_workspace_id
  infrastructure_subnet_id       = var.subnet_id
  infrastructure_resource_group_name = "ME_cae-${var.resource_prefix}_${var.resource_group_name}_${var.location}"
  tags                           = var.tags
}

# Backend Container App
resource "azurerm_container_app" "backend" {
  name                         = "ca-backend-${var.resource_prefix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  registry {
    server               = var.container_registry_login_server
    username             = var.container_registry_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.container_registry_admin_password
  }

  secret {
    name  = "database-url"
    value = var.database_url
  }

  secret {
    name  = "appinsights-connection-string"
    value = var.appinsights_connection_string
  }

  ingress {
    external_enabled = true
    target_port      = 8000
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 0
    max_replicas = 1

    container {
      name   = "backend"
      image  = "${var.container_registry_login_server}/proximity-alarm-backend:latest"
      cpu    = var.backend_cpu
      memory = var.backend_memory

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        secret_name = "appinsights-connection-string"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "FRONTEND_URL"
        value = "https://ca-frontend-${var.resource_prefix}.${azurerm_container_app_environment.main.default_domain}"
      }

      liveness_probe {
        transport = "HTTP"
        path      = "/health"
        port      = 8000
      }

      readiness_probe {
        transport = "HTTP"
        path      = "/health"
        port      = 8000
      }
    }
  }
}

# Frontend Container App
resource "azurerm_container_app" "frontend" {
  name                         = "ca-frontend-${var.resource_prefix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  registry {
    server               = var.container_registry_login_server
    username             = var.container_registry_admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.container_registry_admin_password
  }

  ingress {
    external_enabled = true
    target_port      = 8081
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 0
    max_replicas = 3

    container {
      name   = "frontend"
      image  = "${var.container_registry_login_server}/proximity-alarm-frontend:latest"
      cpu    = var.frontend_cpu
      memory = var.frontend_memory
    }
  }
}
