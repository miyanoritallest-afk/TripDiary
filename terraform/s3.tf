resource "aws_s3_bucket" "photos" {
  # アカウント ID をサフィックスに付けてグローバル一意性を確保
  bucket = "${var.project}-photos-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name    = "${var.project}-photos"
    Project = var.project
    Env     = var.env
  }
}

# 写真は公開コンテンツのため GET のみパブリック許可
resource "aws_s3_bucket_public_access_block" "photos" {
  bucket = aws_s3_bucket.photos.id

  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "photos_public_read" {
  bucket = aws_s3_bucket.photos.id
  depends_on = [aws_s3_bucket_public_access_block.photos]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.photos.arn}/*"
      }
    ]
  })
}

# Next.js アプリからの写真アップロード・取得に必要な CORS 設定
resource "aws_s3_bucket_cors_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"] # 本番運用時は EIP の URL に絞ること
    max_age_seconds = 3000
  }
}
