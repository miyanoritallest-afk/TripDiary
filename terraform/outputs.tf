output "app_url" {
  description = "ブラウザで開くアプリの URL"
  value       = "http://${aws_eip.app.public_ip}:3000"
}

output "ec2_ssh" {
  description = "EC2 インスタンスへの SSH 接続コマンド"
  value       = "ssh -i ~/.ssh/id_rsa ec2-user@${aws_eip.app.public_ip}"
}

output "rds_endpoint" {
  description = "RDS PostgreSQL のエンドポイント（EC2 内から psql で接続する場合に使用）"
  value       = aws_db_instance.postgres.address
}

output "s3_bucket_name" {
  description = "写真アップロード用 S3 バケット名"
  value       = aws_s3_bucket.photos.bucket
}

output "elastic_ip" {
  description = "EC2 の固定パブリック IP"
  value       = aws_eip.app.public_ip
}
