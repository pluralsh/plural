use Mix.Config

config :core, Core.Repo,
  username: "postgres",
  password: "postgres",
  database: "forge_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :core, Core.Influx,
  database: "plural",
  host: "localhost",
  auth: [method: :basic, username: "forge", password: "forgepwd"],
  port: 8086

config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

config :rtc, RtcWeb.Endpoint,
  http: [port: 4002],
  server: false

config :logger, level: :warn

path = __ENV__.file |> Path.dirname()

config :core, :jwt,
  pk: Path.join(path, "testkey.pem") |> File.read!(),
  cert: Path.join(path, "testcert.crt") |> File.read!(),
  iss: "forge.piazza.app",
  aud: "forge.piazza.app"

config :goth,
  # json: System.get_env("GOOGLE_APPLICATION_CREDENTIALS") |> File.read!(),
  disabled: true

config :piazza_core, aes_key: "1HdFP1DuK7xkkcEBne41yAwUY8NSfJnYfGVylYYCS2U="

config :core, :consumers, [Core.EchoConsumer]

config :core, Core.Email.Mailer,
  adapter: Bamboo.TestAdapter

config :core, vulnerability: ~s(
  {
    "VulnerabilityID": "CVE-2019-19242",
    "PkgName": "sqlite-libs",
    "InstalledVersion": "3.26.0-r3",
    "FixedVersion": "3.28.0-r2",
    "Layer": {
      "Digest": "sha256:aafecf9bbbfd514858f0d93fa0f65c2d59c8a1c46ec4b55963e42619f00a0a61",
      "DiffID": "sha256:fbe16fc07f0d81390525c348fbd720725dcae6498bd5e902ce5d37f2b7eed743"
    },
    "SeveritySource": "nvd",
    "PrimaryURL": "https://avd.aquasec.com/nvd/cve-2019-19242",
    "Title": "sqlite: SQL injection in sqlite3ExprCodeTarget in expr.c",
    "Description": "SQLite 3.30.1 mishandles pExpr-\u003ey.pTab, as demonstrated by the TK_COLUMN case in sqlite3ExprCodeTarget in expr.c.",
    "Severity": "MEDIUM",
    "CweIDs": [
      "CWE-476"
    ],
    "CVSS": {
      "nvd": {
        "V2Vector": "AV:N/AC:M/Au:N/C:N/I:N/A:P",
        "V3Vector": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H",
        "V2Score": 4.3,
        "V3Score": 5.9
      },
      "redhat": {
        "V3Vector": "CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H",
        "V3Score": 5.9
      }
    }
  }
)

config :worker,
  rollout_pipeline: []

config :worker,
  upgrade_pipeline: []
