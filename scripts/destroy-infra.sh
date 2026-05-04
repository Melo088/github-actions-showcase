#!/usr/bin/env bash
# destroy-infra.sh — destruye la infraestructura AWS del showcase.
#
# Uso: ./scripts/destroy-infra.sh
# Requiere: terraform, aws cli (jq opcional para fallback de CloudFront)

# No usamos set -euo pipefail global porque manejamos fallos explicitamente
# en terraform destroy y los comandos de fallback.

# ─── Colores ────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $*"; }
info() { echo -e "${YELLOW}→${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠${RESET}  $*"; }
die()  { echo -e "${RED}✗ ERROR:${RESET} $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="${SCRIPT_DIR}/../terraform"

# ─── 1. CABECERA ─────────────────────────────────────────────────────────────
echo
echo -e "${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   GitHub Actions Showcase — Infra III    ║${RESET}"
echo -e "${BOLD}║        Destruccion de infraestructura    ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo

# ─── 2. CAPTURAR DIST_ID ANTES DE DESTRUIR EL STATE ─────────────────────────
# Lo necesitamos para el fallback CLI. Si el state ya no existe, pedimos al usuario.
DIST_ID=""
if command -v terraform &>/dev/null; then
  DIST_ID=$(cd "$TF_DIR" && terraform output -raw cloudfront_distribution_id 2>/dev/null || true)
fi

if [[ -n "$DIST_ID" ]]; then
  info "CloudFront distribution detectada: ${DIST_ID}"
else
  warn "No se pudo leer el ID de CloudFront desde el state de Terraform."
  read -rp "  Ingresa el Distribution ID manualmente (o Enter para saltar): " DIST_ID
fi
echo

# ─── 3. RECORDATORIO S3 ──────────────────────────────────────────────────────
echo -e "${YELLOW}${BOLD}Antes de continuar:${RESET}"
echo
echo -e "  El script intentara borrar el bucket S3 automaticamente via Terraform."
echo -e "  Si ya borraste el bucket desde la consola AWS, es seguro continuar."
echo -e "  Si no, Terraform lo vaciara y borrara como parte del destroy."
echo
echo -e "  Para borrar manualmente (opcional):"
echo -e "    Consola AWS → S3 → seleccionar bucket → Empty → Delete"
echo
read -rp "¿Continuar con terraform destroy? (s/n): " confirm
echo

if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
  warn "Operacion cancelada."
  exit 0
fi

# ─── 4. TERRAFORM DESTROY ────────────────────────────────────────────────────
info "Corriendo terraform destroy..."
echo

cd "$TF_DIR"
TF_OK=false
if terraform destroy -auto-approve; then
  TF_OK=true
  ok "terraform destroy completado"
else
  warn "terraform destroy termino con errores — intentando fallback via AWS CLI"
fi

# ─── 5. FALLBACK CLOUDFRONT VIA CLI ──────────────────────────────────────────
echo
CF_DELETED=false

if $TF_OK; then
  # Terraform fue exitoso; verificar que la distribucion no quede colgada
  if [[ -n "$DIST_ID" ]]; then
    if ! aws cloudfront get-distribution --id "$DIST_ID" &>/dev/null 2>&1; then
      CF_DELETED=true
    else
      warn "Terraform termino OK pero la distribucion ${DIST_ID} aun existe. Intentando eliminarla..."
    fi
  else
    CF_DELETED=true
  fi
fi

if ! $CF_DELETED && [[ -n "$DIST_ID" ]]; then
  if ! aws cloudfront get-distribution --id "$DIST_ID" &>/dev/null 2>&1; then
    ok "CloudFront distribution ${DIST_ID} ya no existe"
    CF_DELETED=true
  elif command -v jq &>/dev/null; then
    info "Deshabilitando distribucion CloudFront ${DIST_ID} via CLI..."
    info "  (CloudFront tarda 5-15 min en propagar — espera antes de borrar)"
    echo

    CONFIG_RESPONSE=$(aws cloudfront get-distribution-config --id "$DIST_ID") \
      || die "No se pudo obtener la config de CloudFront"

    ETAG=$(echo "$CONFIG_RESPONSE" | jq -r '.ETag')
    DIST_CONFIG=$(echo "$CONFIG_RESPONSE" | jq '.DistributionConfig | .Enabled = false')

    aws cloudfront update-distribution \
      --id "$DIST_ID" \
      --if-match "$ETAG" \
      --distribution-config "$DIST_CONFIG" > /dev/null \
      || die "No se pudo deshabilitar la distribucion CloudFront"

    ok "Distribucion deshabilitada — esperando propagacion..."
    aws cloudfront wait distribution-deployed --id "$DIST_ID" \
      || die "Timeout esperando que CloudFront propague. Intenta borrarla manualmente en unos minutos."

    NEW_ETAG=$(aws cloudfront get-distribution --id "$DIST_ID" | jq -r '.ETag')
    aws cloudfront delete-distribution --id "$DIST_ID" --if-match "$NEW_ETAG" \
      || die "No se pudo eliminar la distribucion CloudFront"

    ok "CloudFront distribution ${DIST_ID} eliminada via CLI"
    CF_DELETED=true
  else
    warn "jq no esta instalado — no se puede eliminar CloudFront automaticamente."
    warn "Elimina la distribucion manualmente:"
    warn "  Consola AWS → CloudFront → Distributions → ${DIST_ID} → Disable → Delete"
  fi
fi

# ─── 6. RESUMEN FINAL ────────────────────────────────────────────────────────
echo
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  Sesion de destruccion completada${RESET}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${RESET}"
echo
echo -e "  ${BOLD}Estado:${RESET}"

if $TF_OK; then
  echo -e "    ${GREEN}✓${RESET} terraform destroy — OK"
else
  echo -e "    ${RED}✗${RESET} terraform destroy — con errores"
fi

if $CF_DELETED; then
  echo -e "    ${GREEN}✓${RESET} CloudFront distribution — eliminada"
elif [[ -n "$DIST_ID" ]]; then
  echo -e "    ${YELLOW}?${RESET} CloudFront distribution ${DIST_ID} — verificar manualmente"
fi

echo
echo -e "  ${BOLD}Verifica en la consola AWS que no queden recursos activos:${RESET}"
echo -e "    → S3           → Buckets (debe estar vacio)"
echo -e "    → CloudFront   → Distributions (debe estar vacio)"
echo -e "    → EC2          → No se crearon instancias en este proyecto"
echo
echo -e "  ${RED}${BOLD}Recuerda:${RESET} las credenciales del sandbox expiran al cerrar la sesion."
echo -e "  Una vez expiradas no podras limpiar recursos — todo debe quedar limpio ahora."
echo
