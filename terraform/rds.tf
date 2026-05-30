resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db-subnet-group"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_c.id]

  tags = {
    Name    = "${var.project}-db-subnet-group"
    Project = var.project
  }
}

resource "aws_db_instance" "postgres" {
  identifier        = "${var.project}-postgres"
  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro"
  allocated_storage = 20       # フリーティア上限
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # EC2 からのみ接続可。インターネットには公開しない
  publicly_accessible = false
  multi_az            = false

  # デモ用: 削除時にスナップショットを取らない
  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name    = "${var.project}-postgres"
    Project = var.project
    Env     = var.env
  }
}
