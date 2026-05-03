export const EVENTOS = [
  {
    id:          'push',
    nombre:      'push',
    descripcion: 'Se activa al subir commits a una rama. El trigger más común para deployar automáticamente cuando el código llega a main.',
    icon:        'git-push',
  },
  {
    id:          'pull_request',
    nombre:      'pull_request',
    descripcion: 'Se activa cuando se abre, actualiza o cierra un pull request. Ideal para correr tests de calidad antes de fusionar cambios.',
    icon:        'git-pull-request',
  },
  {
    id:          'schedule',
    nombre:      'schedule',
    descripcion: 'Ejecuta el workflow según una expresión cron. Útil para tareas periódicas como backups, reportes nocturnos o limpieza de recursos.',
    icon:        'clock',
  },
  {
    id:          'workflow_dispatch',
    nombre:      'workflow_dispatch',
    descripcion: 'Permite lanzar el workflow manualmente desde la UI de GitHub o vía API REST. Soporta inputs personalizados para mayor control.',
    icon:        'play',
  },
]
