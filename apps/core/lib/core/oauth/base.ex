defmodule Core.OAuth.Base do
  require Logger

  defmacro __using__(_) do
    quote do
      import Core.OAuth.Base
      import System, only: [get_env: 1]
      require Logger
    end
  end

  def build_user(blob) do
    Logger.info "Found oauth user: #{inspect(blob)}"
    %{
      email: blob["email"],
      name: find_name(blob),
      avatar: blob["profile"]
    }
  end

  defp find_name(%{"name" => name}), do: name
  defp find_name(%{"firstName" => _ } = blob), do: "#{blob["firstName"]} #{blob["lastName"]}"
  defp find_name(_), do: nil
end
