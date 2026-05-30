terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # ローカルステート（課題用）
  # チーム開発時は以下の S3 バックエンドに切り替える:
  # backend "s3" {
  #   bucket         = "tripdiary-tfstate"
  #   key            = "demo/terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   dynamodb_table = "tripdiary-tflock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}

# Amazon Linux 2023 最新 AMI を自動取得
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_caller_identity" "current" {}
