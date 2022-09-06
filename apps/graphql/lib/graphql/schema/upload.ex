defmodule GraphQl.Schemas.Upload do
  use Absinthe.Schema.Notation

  alias Absinthe.Blueprint

  scalar :upload_or_url do
    parse fn
      %Blueprint.Input.String{value: value}, context ->
        fetch_upload(context, value)

      %Blueprint.Input.Null{}, _ ->
        {:ok, nil}

      _, _ ->
        :error
    end

    serialize fn _ ->
      raise "The `:upload` scalar cannot be returned!"
    end
  end

  defp fetch_upload(%{__absinthe_plug__: %{uploads: %{} = uploads}}, value),
    do: {:ok, Map.get(uploads, value, value)}
  defp fetch_upload(_, value) do
    case Core.Firewall.check(value) do
      :ok -> {:ok, value}
      _ -> :error
    end
  end
end
