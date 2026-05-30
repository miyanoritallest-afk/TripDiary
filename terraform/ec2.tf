resource "aws_key_pair" "deployer" {
  key_name   = "${var.project}-key"
  public_key = var.ssh_public_key

  tags = {
    Name    = "${var.project}-key"
    Project = var.project
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = aws_key_pair.deployer.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_s3.name

  root_block_device {
    volume_type = "gp3"
    volume_size = 20 # フリーティア 30GB 以内
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    db_host           = aws_db_instance.postgres.address
    db_name           = var.db_name
    db_username       = var.db_username
    db_password       = var.db_password
    nextauth_secret   = var.nextauth_secret
    anthropic_api_key = var.anthropic_api_key
    s3_bucket         = aws_s3_bucket.photos.bucket
    aws_region        = var.aws_region
  })

  # AMI やインスタンスタイプ変更時のみ再作成（user_data 更新では再作成しない）
  lifecycle {
    ignore_changes = [user_data]
  }

  tags = {
    Name    = "${var.project}-app"
    Project = var.project
    Env     = var.env
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name    = "${var.project}-eip"
    Project = var.project
  }
}
