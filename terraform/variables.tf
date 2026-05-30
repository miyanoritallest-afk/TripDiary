variable "aws_region" {
  description = "AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project" {
  description = "プロジェクト名（リソース名のプレフィックスに使用）"
  type        = string
  default     = "tripdiary"
}

variable "env" {
  description = "環境名"
  type        = string
  default     = "demo"
}

# --- Database ---

variable "db_name" {
  description = "PostgreSQL データベース名"
  type        = string
  default     = "tripdiary"
}

variable "db_username" {
  description = "PostgreSQL ユーザー名"
  type        = string
  default     = "tripdiary_app"
}

variable "db_password" {
  description = "PostgreSQL パスワード（terraform.tfvars に記載、git にコミットしない）"
  type        = string
  sensitive   = true
}

# --- App secrets ---

variable "nextauth_secret" {
  description = "NextAuth.js のシークレットキー"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API キー（ナビちゃん AI 機能用）"
  type        = string
  sensitive   = true
}

# --- SSH access ---

variable "ssh_public_key" {
  description = "SSH 公開鍵の内容（~/.ssh/id_rsa.pub の中身を貼り付ける）"
  type        = string
}

variable "my_ip_cidr" {
  description = "SSH 接続を許可する自分の IP（例: 203.0.113.42/32）"
  type        = string
}
