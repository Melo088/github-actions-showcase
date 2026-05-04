# NOTA: si cambias la versión de algún provider, borra el lock file y reinicia:
#   rm terraform/.terraform.lock.hcl
#   terraform init
#   terraform apply
#
# Se usa null_resource + AWS CLI para el bucket S3 porque el sandbox tiene
# explicit deny en s3:GetBucketObjectLockConfiguration, lo que hace fallar
# cualquier operación con aws_s3_bucket sin importar la versión del provider.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.67"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

# Las credenciales se leen de las variables de entorno
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY y AWS_SESSION_TOKEN — nunca hardcodeadas.
provider "aws" {
  region = var.aws_region
}

# ─── S3: bucket via AWS CLI ────────────────────────────────────────────────
# Se evita aws_s3_bucket porque el sandbox bloquea s3:GetBucketObjectLockConfiguration.
# AWS CLI no ejecuta esa llamada, así que este workaround es estable.
resource "null_resource" "s3_setup" {
  triggers = {
    bucket_name = var.bucket_name
    aws_region  = var.aws_region
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws s3api create-bucket \
        --bucket ${var.bucket_name} \
        --region ${var.aws_region} && \
      aws s3api delete-public-access-block \
        --bucket ${var.bucket_name} && \
      aws s3 website s3://${var.bucket_name} \
        --index-document index.html \
        --error-document index.html && \
      aws s3api put-bucket-policy \
        --bucket ${var.bucket_name} \
        --policy '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::${var.bucket_name}/*"}]}'
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      aws s3 rm s3://${self.triggers["bucket_name"]} --recursive || true
      aws s3api delete-bucket \
        --bucket ${self.triggers["bucket_name"]} \
        --region ${self.triggers["aws_region"]} || true
    EOT
  }
}

# ─── CloudFront: distribución ───────────────────────────────────────────────
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "GitHub Actions Showcase — ${var.bucket_name}"

  origin {
    origin_id = "s3-website"
    # Website endpoint HTTP del bucket — formato fijo, no depende del recurso S3
    domain_name = "${var.bucket_name}.s3-website-${var.aws_region}.amazonaws.com"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-website"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # SPA: cualquier 404 devuelve index.html con 200
  custom_error_response {
    error_code            = 404
    response_page_path    = "/index.html"
    response_code         = 200
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Certificado por defecto de CloudFront (*.cloudfront.net)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  depends_on = [null_resource.s3_setup]
}
