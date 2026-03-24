# Proximity Alarm — Terraform Infrastructure

Terraform configuration for deploying the Proximity Alarm app to Azure.

**Provider**: `hashicorp/azurerm ~> 4.0` (v4.65.0)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Resource Group: rg-proximity-alarm-{env}                   │
│                                                             │
│  ┌──────────────────────────────────────────────┐           │
│  │  VNet: vnet-proximity-alarm-{env}            │           │
│  │                                              │           │
│  │  ┌────────────────────┐  ┌────────────────┐  │           │
│  │  │  Container Apps     │  │  PostgreSQL    │  │           │
│  │  │  snet (10.0.0.0/23)│  │  snet          │  │           │
│  │  │                    │  │  (10.0.2.0/24) │  │           │
│  │  │  ┌──────────────┐  │  │                │  │           │
│  │  │  │ Backend :8000 │  │  │  Flexible      │  │           │
│  │  │  └──────────────┘  │  │  Server v15    │  │           │
│  │  │  ┌──────────────┐  │  │                │  │           │
│  │  │  │Frontend :8081 │  │  └────────────────┘  │           │
│  │  │  └──────────────┘  │                       │           │
│  │  └────────────────────┘                       │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ACR          │  │ Log Analytics│  │ App Insights │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Modules

| Module              | Resources                                           |
|---------------------|-----------------------------------------------------|
| `network`           | VNet, subnets (Container Apps + DB), Private DNS     |
| `database`          | PostgreSQL Flexible Server v15 + app database        |
| `container_registry`| Azure Container Registry (Basic SKU)                 |
| `container_apps`    | Container Apps Environment, Backend + Frontend apps, CORS  |
| `monitoring`        | Log Analytics Workspace, Application Insights        |

## Usage

### Prerequisites
- [Terraform >= 1.5](https://developer.hashicorp.com/terraform/install)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- An Azure subscription

### Commands

```bash
# Login to Azure
az login

# Initialize Terraform
cd infra/terraform
terraform init

# Plan (dev environment)
terraform plan -var-file=environments/dev.tfvars -var="db_admin_password=YOUR_PASSWORD"

# Apply
terraform apply -var-file=environments/dev.tfvars -var="db_admin_password=YOUR_PASSWORD"

# Destroy (clean up)
terraform destroy -var-file=environments/dev.tfvars -var="db_admin_password=YOUR_PASSWORD"
```

### Key Features

- **CORS at infrastructure level**: Backend container app has a `cors` block in ingress allowing the frontend origin, `localhost:8081`, and `localhost:19006`
- **Dynamic URLs**: Frontend URL and backend URL are constructed from the Container Apps Environment default domain (no hardcoded URLs)
- **Alembic migrations**: Backend container runs `alembic upgrade head` before starting uvicorn
- **Remote state**: Stored in Azure Storage (`proxalarmdevsa/tfstate`)

## Environment Configurations

| File                             | Environment |
|----------------------------------|-------------|
| `environments/dev.tfvars`        | Development |
| `environments/production.tfvars` | Production  |

The `db_admin_password` is always passed via `-var` flag or `TF_VAR_db_admin_password` env var — never stored in files.
