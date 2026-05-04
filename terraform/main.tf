terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Las credenciales se leen de las variables de entorno
# AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY — nunca hardcodeadas.
provider "aws" {
  region = var.aws_region
}

# ─── S3: bucket ────────────────────────────────────────────────────────────
resource "aws_s3_bucket" "site" {
  bucket = var.bucket_name
}

# Habilitar static website hosting (index + error → index.html para SPA)
resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Desbloquear acceso público — necesario para website hosting sin IAM
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy: acceso de lectura anónimo a todos los objetos
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id

  # Depende del bloque de acceso público — debe aplicarse después
  depends_on = [aws_s3_bucket_public_access_block.site]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.site.arn}/*"
      }
    ]
  })
}

# ─── CloudFront: distribución ───────────────────────────────────────────────
locals {
  # Website endpoint HTTP del bucket — CloudFront apunta aquí, no al domain regional
  s3_website_endpoint = aws_s3_bucket_website_configuration.site.website_endpoint
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "GitHub Actions Showcase — ${var.bucket_name}"

  origin {
    origin_id   = "s3-website"
    # Endpoint HTTP del website hosting — no el domain S3 regional
    domain_name = local.s3_website_endpoint

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

  # SPA: cualquier 404 devuelve index.html con 200 (react-router / anclas)
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

  depends_on = [aws_s3_bucket_policy.site]
}
