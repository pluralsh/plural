defmodule Watchman.Forge.Client do
  @headers [
    {"accept", "application/json"},
    {"content-type", "application/json"}
  ]

  defmodule Response, do: defstruct [:data, :errors]

  def run(query, variables, type_spec) do
    token = Watchman.Forge.Config.fetch()
    Mojito.post(url(), [{"authorization", "Bearer #{token}"} | @headers], Jason.encode!(%{
      query: query,
      variables: variables
    }))
    |> decode(type_spec)
  end

  defp decode({:ok, %{body: body}}, type_spec) do
    case Poison.decode!(body, as: %Response{data: type_spec}) do
      %Response{data: data} when not is_nil(data) -> {:ok, data}
      %Response{errors: errors} -> {:error, errors}
    end
  end
  defp decode({:error, _}, _), do: {:error, "network error"}

  defp url(), do: Application.get_env(:watchman, :forge_url)
end