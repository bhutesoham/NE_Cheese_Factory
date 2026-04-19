resource "aws_db_instance" "default" {
  allocated_storage = 10
  db_name              = "kaaswinkel"
  engine               = "postgres"
  engine_version       = "18"
  instance_class       = "db.t4g.micro"
  username             = "mypostgres"
  password             = "Ingolstadt09#"
  skip_final_snapshot  = true
}

resource "aws_security_group" "rds" {
    name = "rds_sg"
    vpc_id = aws_vpc.main.id
}