# EC2 インスタンスプロファイル経由で S3 にアクセスする
# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY を環境変数に入れなくて済む（より安全）

resource "aws_iam_role" "ec2_s3" {
  name = "${var.project}-ec2-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "${var.project}-ec2-s3-role"
    Project = var.project
  }
}

resource "aws_iam_role_policy" "ec2_s3" {
  name = "${var.project}-s3-access"
  role = aws_iam_role.ec2_s3.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.photos.arn}/photos/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.photos.arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_s3" {
  name = "${var.project}-ec2-profile"
  role = aws_iam_role.ec2_s3.name
}
