variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_prefix" {
  type = string
}

variable "subnet_id" {
  description = "Subnet ID for the Container Apps environment"
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID for diagnostics"
  type        = string
}

variable "container_registry_login_server" {
  description = "ACR login server URL"
  type        = string
}

variable "container_registry_admin_username" {
  description = "ACR admin username"
  type        = string
}

variable "container_registry_admin_password" {
  description = "ACR admin password"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "appinsights_connection_string" {
  description = "Application Insights connection string"
  type        = string
  sensitive   = true
}

variable "backend_cpu" {
  description = "CPU cores for backend container"
  type        = number
  default     = 0.25
}

variable "backend_memory" {
  description = "Memory for backend container (e.g. 0.5Gi)"
  type        = string
  default     = "0.5Gi"
}

variable "frontend_cpu" {
  description = "CPU cores for frontend container"
  type        = number
  default     = 0.25
}

variable "frontend_memory" {
  description = "Memory for frontend container"
  type        = string
  default     = "0.5Gi"
}

variable "environment" {
  description = "Environment name (e.g. dev, production)"
  type        = string
}

variable "tags" {
  type = map(string)
}
