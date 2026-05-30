resource "aws_security_group" "ec2" {
  name        = "${var.project}-ec2-sg"
  description = "EC2 app server security group"
  vpc_id      = aws_vpc.main.id

  # SSH は自分の IP からのみ許可（my_ip_cidr を terraform.tfvars で設定）
  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }

  # Next.js アプリ（ポート 3000）を全開放
  ingress {
    description = "Next.js app"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project}-ec2-sg"
    Project = var.project
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project}-rds-sg"
  description = "RDS PostgreSQL security group"
  vpc_id      = aws_vpc.main.id

  # PostgreSQL は EC2 からのみ許可（インターネットには公開しない）
  ingress {
    description     = "PostgreSQL from EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  tags = {
    Name    = "${var.project}-rds-sg"
    Project = var.project
  }
}
