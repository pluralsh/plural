~w(rel plugins *.exs)
|> Path.join()
|> Path.wildcard()
|> Enum.map(&Code.eval_file(&1))

version = File.read!("VERSION")

use Distillery.Releases.Config,
  # This sets the default release built by `mix distillery.release`
  default_release: :default,
  # This sets the default environment used by `mix distillery.release`
  default_environment: Mix.env()

environment :dev do
  set dev_mode: true
  set include_erts: false
  set cookie: :"[0u(BUb%Eh955Mg5V>:Mgxqa8NY`de)3ikLXo:iM]pU6HUy9NC}C4T(5A=|Xau8/"
end

environment :prod do
  set include_erts: true
  set include_src: false
  set cookie: :"apMPW^f~jR;8CVeiv`d4(6y]Rv`v_Z;ghL:~3&j!1QM)YRG5_TTpz2q2nGu)9>}l"
  set vm_args: "rel/vm.args"
  set config_providers: [
    {Distillery.Releases.Config.Providers.Elixir, ["${RELEASE_ROOT_DIR}/etc/config.exs"]},
    {Distillery.Releases.Config.Providers.Elixir, ["${RELEASE_ROOT_DIR}/etc/app.exs"]}
  ]
  set overlays: [
    {:copy, "rel/config/config.exs", "etc/config.exs"},
    {:copy, "rel/config/<%= release_name %>.exs", "etc/app.exs"}
  ]
end

release :forge do
  set version: version
  set applications: [
    :runtime_tools,
    api: :permanent,
    core: :permanent,
    graphql: :load
  ]
  set commands: [
    migrate: "rel/commands/migrate.sh",
    drop: "rel/commands/drop.sh"
  ]
end