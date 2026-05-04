variable "bucket_name" {
  description = "Nombre del bucket S3 que aloja el sitio estático"
  type        = string
  default     = "github-actions-showcase"
}

variable "aws_region" {
  description = "Región de AWS donde se crean los recursos"
  type        = string
  default     = "us-east-1"
}
