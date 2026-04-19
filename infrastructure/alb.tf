# --- YOUR ORIGINAL SETTINGS ---

resource "aws_security_group" "alb_sg"{
    name = "alb_sg"
    vpc_id = aws_vpc.main.id
}

resource "aws_lb" "online_app_alb" {
    name               = "dev-load-balancer"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [aws_security_group.alb_sg.id]
    subnets            = [for subnet in aws_subnet.public_subnets : subnet.id]

    enable_deletion_protection = false

    access_logs {
        bucket  = aws_s3_bucket.alb_logs.id
        prefix  = "online-cheese-shop-lb"
        enabled = true
    }

    tags = {
        Environment = "dev"
    }
}

resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "allow_all_outbound" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to "all"
}

# --- APPENDED BRIDGE SETTINGS ---

# This Target Group acts as the destination for the Load Balancer
resource "aws_lb_target_group" "app_tg" {
  name        = "cheese-shop-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Required for Fargate

  health_check {
    path                = "/"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

# This Listener tells the ALB to forward traffic to the Target Group
resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.online_app_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}