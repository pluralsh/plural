defmodule Core do
  @moduledoc nil

  def conf(key), do: Application.get_env(:core, key)
end
