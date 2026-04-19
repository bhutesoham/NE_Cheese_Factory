# 1. THE CLUSTER
resource "aws_ecs_cluster" "main" {
  name = "cheese-shop-cluster"
}

# 2. THE SECURITY GROUP (The Firewall for the App)
resource "aws_security_group" "ecs_tasks_sg" {
  name        = "ecs-tasks-sg"
  description = "Allow inbound traffic from ALB only"
  vpc_id      = aws_vpc.main.id

  # Ingress: Only allow traffic coming FROM the ALB Security Group
  ingress {
    protocol        = "tcp"
    from_port       = 80
    to_port         = 80
    security_groups = [aws_security_group.alb_sg.id]
  }

  # Egress: Allow all outbound traffic (so the app can pull images & talk to the internet)
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. THE TASK DEFINITION (The Blueprint)
resource "aws_ecs_task_definition" "service" {
  family                   = "cheese-shop-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  
  # This role allows ECS to pull images from ECR and push logs
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "first"
      image     = "${aws_ecr_repository.Cheese_Shop_repo.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
    }
  ])
}

# 4. THE SERVICE (The Manager)
resource "aws_ecs_service" "app_service" {
  name            = "cheese-shop-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.service.arn
  launch_type     = "FARGATE"
  desired_count   = 2 # Runs two instances for reliability

  network_configuration {
    # Place tasks in private subnets for security
    subnets          = aws_subnet.private_subnets[*].id
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = false 
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg.arn
    container_name   = "first" # Must match the name in your task defination
    container_port   = 80
  }

  # Wait for the ALB listener to be ready before starting the service
  depends_on = [aws_lb_listener.front_end]
}

# 5. IAM ROLE (Necessary for Fargate to function)
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "cheese-shop-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}