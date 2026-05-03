export const MARKETPLACE_ACTIONS = [
  {
    name:        'actions/checkout@v6',
    author:      'GitHub',
    description: 'Clona el repositorio en el runner para que los pasos siguientes puedan acceder al código fuente.',
    stars:       '7.8k estrellas',
    icon:        'repo-clone',
  },
  {
    name:        'actions/setup-node@v6',
    author:      'GitHub',
    description: 'Instala y configura una versión específica de Node.js con soporte para caché de dependencias.',
    stars:       '5.8k estrellas',
    icon:        'package',
  },
  {
    name:        'aws-actions/configure-aws-credentials@v6',
    author:      'Amazon Web Services',
    description: 'Configura credenciales de AWS en el runner usando secrets o OIDC para autenticación segura.',
    stars:       '2.9k estrellas',
    icon:        'key',
  },
  {
    name:        'docker/build-push-action@v7',
    author:      'Docker',
    description: 'Construye imágenes Docker con BuildKit y las publica en un registry. Soporta multi-platform.',
    stars:       '5.3k estrellas',
    icon:        'container',
  },
  {
    name:        'github/codeql-action@v3',
    author:      'GitHub',
    description: 'Analiza el código en busca de vulnerabilidades usando el motor CodeQL de GitHub Security.',
    stars:       '1.5k estrellas',
    icon:        'shield-check',
  },
  {
    name:        'softprops/action-gh-release@v3',
    author:      'softprops',
    description: 'Crea GitHub Releases automáticamente con artefactos adjuntos y changelog generado.',
    stars:       '5.6k estrellas',
    icon:        'tag',
  },
]
