terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Remote state in Azure Storage
  # The storage account must be created beforehand (see infra/terraform/README.md)
  backend "azurerm" {
    resource_group_name  = "proxalarm-dev-gr"
    storage_account_name = "proxalarmdevsa"
    container_name       = "tfstate"
    key                  = "proximity-alarm.tfstate"
  }
}

provider "azurerm" {
  features {}
}
