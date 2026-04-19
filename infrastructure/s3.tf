resource "aws_security_group" "s3"{
    name = "s3_sg"
    vpc_id = aws_vpc.main.id
}

# RDS reference the security group
resource "aws_s3_bucket" "picture_storage" {
  bucket = "cheese-pictures-bucket"

  tags = {
    Name        = "Dev_picture_bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_public_access_block" "public_access_to_pictures" {
  bucket = aws_s3_bucket.picture_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 1. Automatically fetch the correct ELB Account ID for us-east-1
data "aws_elb_service_account" "main" {}

# 2. Automatically fetch your own AWS Account ID
data "aws_caller_identity" "current" {}

# 3. Define the S3 Bucket
resource "aws_s3_bucket" "alb_logs" {
  bucket        = "cheese-shop-alb-logs-${data.aws_caller_identity.current.account_id}"
  force_destroy = true # Allows you to delete the bucket even if it has logs
  tags = {
    Name        = "alb_cloudwatch_logs"
    Environment = "Dev"
  }
}

# 4. Attach the MUST-HAVE Bucket Policy
resource "aws_s3_bucket_policy" "allow_alb_logging" {
  bucket = aws_s3_bucket.alb_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          # This allows the ALB Service itself to write files
          AWS = data.aws_elb_service_account.main.arn
        }
        Action   = "s3:PutObject"
        # The path MUST match your ALB's prefix and your account ID
        Resource = "${aws_s3_bucket.alb_logs.arn}/online-cheese-shop-lb/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_public_access_block" "alb_logs_block" {
  bucket = aws_s3_bucket.alb_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}