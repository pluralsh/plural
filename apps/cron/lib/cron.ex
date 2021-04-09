defmodule Cron do
  @moduledoc """
  Documentation for Cron.
  """
  require Logger

  defmacro __using__(opts) do
    env_vars = Keyword.get(opts, :env, [])
    quote do
      import Cron
      require Logger

      def execute() do
        args = Enum.map(unquote(env_vars), &System.get_env/1)
        apply(__MODULE__, :run, args)
      end
    end
  end

  def log(enumerable) do
    Enum.reduce(enumerable, 0, fn
      val, count when is_integer(val) ->
        log_progress(val + count)
      _, count -> log_progress(count + 1)
    end)
  end

  defp log_progress(count) when rem(count, 1000) == 0 do
    Logger.info "Completed #{count} items"
    count
  end
  defp log_progress(count), do: count
end
