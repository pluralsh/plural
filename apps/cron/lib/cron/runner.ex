defmodule Cron.Runner do
  use Task, restart: :transient
  require Logger

  @sleep :timer.seconds(10)

  def start_link(_) do
    Task.start_link(&run_cron/0)
  end

  def run_cron() do
    module = resolve_module()
    Logger.info "Sleeping to initialize dependencies for #{@sleep} seconds first..."
    :timer.sleep(@sleep)
    Logger.info "Starting cron #{module}..."
    module.execute()
  after
    :init.stop()
  end

  def resolve_module() do
    case System.get_env("CRON") do
      cron when is_binary(cron) -> Module.concat(Cron, cron)
      _ -> raise ArgumentError, message: "CRON env var never set"
    end
  end
end
