#!/usr/bin/env bash
# setup-infra.sh — provisiona la infraestructura AWS y sube los secrets a GitHub.
#
# Uso: ./scripts/setup-infra.sh
# Requiere: terraform, aws cli, gh (GitHub CLI autenticado)
#
# NOTA: ejecuta `chmod +x scripts/setup-infra.sh` después de clonar el repo.

set -euo pipefail

# ─── Colores ────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $*"; }
info() { echo -e "${YELLOW}→${RESET} $*"; }
die()  { echo -e "${RED}✗ ERROR:${RESET} $*" >&2; exit 1; }

# ─── 1. CABECERA ─────────────────────────────────────────────────────────────
echo
echo -e "${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   GitHub Actions Showcase — Infra III    ║${RESET}"
echo -e "${BOLD}║        Setup de infraestructura AWS      ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo

# ─── 2. CREDENCIALES AWS ─────────────────────────────────────────────────────
info "Ingresa las credenciales del sandbox de AWS:"
echo

read -rp "  AWS_ACCESS_KEY_ID:     " AWS_ACCESS_KEY_ID
read -rsp "  AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
echo
read -rsp "  AWS_SESSION_TOKEN:     " AWS_SESSION_TOKEN
echo

# Eliminar espacios y saltos de línea que read -s puede capturar al pegar
AWS_ACCESS_KEY_ID="$(printf '%s' "$AWS_ACCESS_KEY_ID"   | tr -d '[:space:]')"
AWS_SECRET_ACCESS_KEY="$(printf '%s' "$AWS_SECRET_ACCESS_KEY" | tr -d '[:space:]')"
AWS_SESSION_TOKEN="$(printf '%s' "$AWS_SESSION_TOKEN"   | tr -d '[:space:]')"

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN

ok "Credenciales cargadas en el entorno"

# ─── 3. REPO DE GITHUB ───────────────────────────────────────────────────────
echo
read -rp "Repo de GitHub (formato usuario/repo): " GITHUB_REPO

[[ "$GITHUB_REPO" == */* ]] || die "El repo debe tener formato 'usuario/repo'"
ok "Repo: ${GITHUB_REPO}"

# ─── 4. TERRAFORM ────────────────────────────────────────────────────────────
echo
info "Inicializando Terraform..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="${SCRIPT_DIR}/../terraform"

cd "$TF_DIR"

terraform init -input=false || die "terraform init falló"
ok "Terraform inicializado"

echo
info "Aplicando configuración (esto puede tardar ~2 min por CloudFront)..."
terraform apply -auto-approve || die "terraform apply falló — revisa los errores arriba"
ok "Infraestructura creada"

echo
info "Leyendo outputs..."
BUCKET=$(terraform output -raw bucket_name)          || die "No se pudo leer bucket_name"
DIST_ID=$(terraform output -raw cloudfront_distribution_id) || die "No se pudo leer cloudfront_distribution_id"
REGION="us-east-1"
URL=$(terraform output -raw website_url)             || die "No se pudo leer website_url"

ok "Bucket:       ${BUCKET}"
ok "Distribution: ${DIST_ID}"
ok "URL:          ${URL}"

# ─── 5. GITHUB SECRETS ───────────────────────────────────────────────────────
echo
info "Subiendo secrets al repo ${GITHUB_REPO}..."

gh secret set AWS_ACCESS_KEY_ID     --body "$AWS_ACCESS_KEY_ID"     --repo "$GITHUB_REPO" \
  || die "No se pudo subir AWS_ACCESS_KEY_ID — ¿está gh autenticado? (gh auth login)"

gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY" --repo "$GITHUB_REPO" \
  || die "No se pudo subir AWS_SECRET_ACCESS_KEY"

gh secret set AWS_REGION            --body "$REGION"                --repo "$GITHUB_REPO" \
  || die "No se pudo subir AWS_REGION"

gh secret set S3_BUCKET_NAME        --body "$BUCKET"                --repo "$GITHUB_REPO" \
  || die "No se pudo subir S3_BUCKET_NAME"

gh secret set CLOUDFRONT_DIST_ID    --body "$DIST_ID"               --repo "$GITHUB_REPO" \
  || die "No se pudo subir CLOUDFRONT_DIST_ID"

gh secret set AWS_SESSION_TOKEN     --body "$AWS_SESSION_TOKEN"     --repo "$GITHUB_REPO" \
  || die "No se pudo subir AWS_SESSION_TOKEN"

ok "6 secrets cargados en ${GITHUB_REPO}"

# ─── 6. RESUMEN FINAL ────────────────────────────────────────────────────────
echo
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ✓ Infraestructura lista${RESET}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${RESET}"
echo
echo -e "  Sitio:  ${BOLD}${URL}${RESET}"
echo -e "  ${YELLOW}(CloudFront puede tardar 5-15 min en propagar — es normal)${RESET}"
echo
echo -e "  Secrets configurados en: ${BOLD}${GITHUB_REPO}${RESET}"
echo -e "  Haz un ${BOLD}git push${RESET} a main para disparar el primer deploy."
echo
echo -e "  ${RED}${BOLD}Recuerda:${RESET} corre ${BOLD}terraform destroy${RESET} al terminar la sesión"
echo -e "     para evitar cargos inesperados en el sandbox."
echo
