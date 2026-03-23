# Proximity Alarm — Terraform Infrastructure

Terraform configuration for deploying the Proximity Alarm app to Azure.

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
| `container_apps`    | Container Apps Environment, Backend + Frontend apps  |
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

### Remote State (recommended for teams)
Uncomment the backend block in `providers.tf` and create the storage account:
```bash
az group create -n devops-learning-tfstate-rg -l eastus
az storage account create -n devopslearningtfstate -g devops-learning-tfstate-rg -l eastus --sku Standard_LRS
az storage container create -n tfstate --account-name devopslearningtfstate
```

## Environment Configurations

| File                             | Environment |
|----------------------------------|-------------|
| `environments/dev.tfvars`        | Development |
| `environments/production.tfvars` | Production  |

The `db_admin_password` is always passed via `-var` flag or `TF_VAR_db_admin_password` env var — never stored in files.
