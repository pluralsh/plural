defmodule GraphQl.Introspection do
  @moduledoc """
  Disable or restrict schema introspection to authorized requests
  """
  @behaviour Absinthe.Plugin

  @prod Mix.env() != :test

  @impl Absinthe.Plugin
  def before_resolution(%{context: %{current_user: %Core.Schema.User{}}} = exec), do: exec
  def before_resolution(%{result: %{emitter: %{selections: [_ | _] = selections}}} = exec) do
    (@prod && Enum.any?(selections, fn %{name: field_name} -> Macro.underscore(field_name) in ["__schema", "__type"] end))
    |> case do
      true -> %{exec | validation_errors: [%Absinthe.Phase.Error{message: "Unauthorized", phase: __MODULE__}]}
      false -> exec
    end
  end
  def before_resolution(exec), do: exec

  @impl Absinthe.Plugin
  def after_resolution(exec), do: exec

  @impl Absinthe.Plugin
  def pipeline(pipeline, _exec), do: pipeline
end
