defmodule Rtc.TestLogger do
  alias Core.Schema.{Test, User}
  alias Core.Services.Tests

  defstruct [:handles, :flushable]

  def new(), do: %__MODULE__{handles: %{}, flushable: flushable()}

  def add_line(%__MODULE__{} = logger, id, line) do
    %{handles: %{^id => f}} = logger = ensure_present(logger, id)
    File.write(f, "#{line}\n")
    logger
  end

  def flush(%__MODULE__{handles: handles, flushable: true}, %Test{} = test, %User{} = user) do
    test = Tests.get_test(test.id)
           |> Core.Repo.preload([:steps])
           |> filter_steps(handles)
    steps = Enum.map(handles, fn {id, path} -> %{id: id, logs: path} end)
    Tests.update_test(%{steps: steps}, test, user)
  end
  def flush(_, _, _), do: :ok

  defp filter_steps(%Test{steps: steps} = test, handles) do
    steps = Enum.filter(steps, &Map.has_key?(handles, &1.id))
    %{test | steps: steps}
  end

  defp ensure_present(%{handles: handles} = logger, id) do
    case Map.get(handles, id) do
      nil ->
        {:ok, path} = Briefly.create()
        %{logger | handles: Map.put(handles, id, path)}
      _ -> logger
    end
  end

  defp flushable(), do: Rtc.conf(:flushable)
end
