defmodule Cron.Runner do
  use Task, restart: :transient

  def start_link(_) do
    Task.start_link(&run_cron/0)
  end

  def run_cron() do
    module = resolve_module()
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
