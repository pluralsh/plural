const util = require('node:util');
const fs = require('node:fs');
const path = require('node:path');
const exec = util.promisify(require('node:child_process').exec);

// Make sure to create an `output` directory in `bin` before running this script.

const inputs = [
  'airbyte',
  'console',
  'airflow',
  'argo-cd',
  'argo-workflows',
  'chatwoot',
  'crossplane',
  'dagster',
  'datahub',
  'etcd',
  'filecoin',
  'ghost',
  'gitlab',
  'grafana',
  'grafana-tempo',
  'growthbook',
  'hasura',
  'influx',
  'ingress-nginx',
  'istio',
  'jitsu',
  'kafka',
  'knative',
  'kserve',
  'kubecost',
  'kubeflow',
  'kubescape',
  'metabase',
  'minecraft',
  'minio',
  'mlflow',
  'mongodb',
  'mysql',
  'n8n',
  'nextcloud',
  'nocodb',
  'oncall',
  'plural',
  'postgres',
  'rabbitmq',
  'ray',
  'redis',
  'reloader',
  'rook',
  'sentry',
  'spark',
  'superset',
  'terraria',
  'touca',
  'trino',
  'valheim',
  'vault',
  'vaultwarden',
]

async function main() {
  for (const input of inputs) {
    try {
      const result = await exec(`python3 bin/docgen.py ${input}`);

      fs.writeFileSync(path.join(__dirname, 'output', `${input}.md`), result.stdout, 'utf8');
    }
    catch (error) {
      console.error(error);
    }
  }
}

main()
