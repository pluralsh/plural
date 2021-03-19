defmodule Worker do
  @moduledoc """
  Top level module for worker application
  """

  def conf(key), do: Application.get_env(:worker, key)
end
