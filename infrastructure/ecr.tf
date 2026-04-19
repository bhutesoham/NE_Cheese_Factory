resource "aws_ecr_repository" "Cheese_Shop_repo" {
  name                 = "cheese-shop-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Output the URL for use in your CI/CD or ECS Task Definition
output "repository_url" {
  value = aws_ecr_repository.Cheese_Shop_repo.repository_url
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  repository = aws_ecr_repository.Cheese_Shop_repo.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}