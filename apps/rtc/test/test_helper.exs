Mimic.copy(Core.Shell.Client)
Mimic.copy(Core.Services.Shell.Pods)
Mimic.copy(Core.Services.Shell.Pods.PodExec)
Mimic.copy(Core.Conduit.Broker)

ExUnit.configure formatters: [JUnitFormatter, ExUnit.CLIFormatter]
ExUnit.start()
