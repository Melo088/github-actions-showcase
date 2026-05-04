output "bucket_name" {
  description = "Nombre del bucket S3"
  value       = var.bucket_name
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront — necesario para invalidar la caché"
  value       = aws_cloudfront_distribution.cdn.id
}

output "cloudfront_domain" {
  description = "Dominio asignado por CloudFront (*.cloudfront.net)"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "website_url" {
  description = "URL pública del sitio desplegado"
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
}
