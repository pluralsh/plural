defmodule Core.Schema.IncidentHistory do
  use Piazza.Ecto.Schema
  alias Core.Schema.{User, Incident}

  defenum Action, edit: 0, create: 1, status: 2, severity: 3, accept: 4, complete: 5

  defmodule Change do
    use Piazza.Ecto.Schema

    embedded_schema do
      field :key,  :string
      field :prev, :string
      field :next, :string
    end

    @valid ~w(key prev next)a

    def changeset(model, attrs \\ %{}) do
      model
      |> cast(attrs, @valid)
      |> validate_required([:key])
    end
  end

  schema "incident_history" do
    field :action, Action

    embeds_many :changes, Change

    belongs_to :actor,    User
    belongs_to :incident, Incident

    timestamps()
  end

  def for_incident(query \\ __MODULE__, incident_id) do
    from(ih in query, where: ih.incident_id == ^incident_id)
  end

  def ordered(query \\ __MODULE__, order \\ [asc: :inserted_at]) do
    from(ih in query, order_by: ^order)
  end

  def changeset(model, attrs \\ %{}, change) do
    model
    |> cast(Map.put(attrs, :changes, build_changes(change)), [:action])
    |> cast_embed(:changes)
    |> add_change(change)
  end

  defp add_change(changeset, change) do
    case get_change(changeset, :action) do
      nil -> put_change(changeset, :action, action(change.changes))
      _ -> changeset
    end
  end

  defp action(%{status: :complete}), do: :complete
  defp action(%{severity: _}), do: :severity
  defp action(%{status: _}), do: :status
  defp action(_), do: :edit

  defp build_changes(%Ecto.Changeset{data: %Incident{} = inc, changes: changes}) do
    Enum.map(changes, fn
      {:tags, tags} -> %{key: "tags", prev: tags(inc.tags), next: tags(tags)}
      {key, val} -> %{key: "#{key}", prev: to_string(Map.get(inc, key)), next: to_string(val)}
    end)
  end

  defp tags(tags) when is_list(tags) do
    Enum.map(tags, &extract_tag/1)
    |> Enum.sort()
    |> Enum.join(", ")
  end
  defp tags(_), do: nil

  defp extract_tag(%Ecto.Changeset{changes: %{tag: tag}}), do: tag
  defp extract_tag(%{tag: tag}), do: tag
end
