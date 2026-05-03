export const PIPELINE_STEPS = [
  {
    id:           'checkout',
    label:        'checkout',
    sublabel:     'actions/checkout@v6',
    runningLabel: 'clonando...',
  },
  {
    id:           'test',
    label:        'test',
    sublabel:     'npm test',
    runningLabel: 'ejecutando tests...',
  },
  {
    id:           'build',
    label:        'build',
    sublabel:     'npm run build',
    runningLabel: 'compilando...',
  },
  {
    id:           'deploy',
    label:        'deploy',
    sublabel:     'aws s3 sync',
    runningLabel: 'subiendo a S3...',
  },
  {
    id:           'cdn',
    label:        'cdn',
    sublabel:     'CloudFront',
    runningLabel: 'invalidando caché...',
  },
]
