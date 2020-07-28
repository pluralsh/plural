ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Watchman.Repo, :manual)

Mimic.copy(Watchman.Deployer)
Mimic.copy(Watchman.Storage.Git)
Mimic.copy(Watchman.Commands.Forge)
Mimic.copy(Watchman.Commands.Command)
Mimic.copy(Watchman.Forge.Repositories)
Mimic.copy(Mojito)
Mimic.copy(Kazan)

{:ok, _} = Application.ensure_all_started(:ex_machina)
