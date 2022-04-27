defmodule Core.WorkOS.Events.Base do
  def user(%{"emails" => emails, "id" => id} = attrs) do
    first = Map.get(attrs, "first_name", "")
    last = Map.get(attrs, "last_name", "")
    email = Enum.find(emails, & &1["primary"])

    %{
      name: "#{first} #{last}",
      email: email["value"],
      external_id: id
    }
  end

  def group(%{"id" => id, "name" => name}), do: %{name: name, external_id: id}

  def domains(nil), do: []
  def domains(domain_list) do
    Enum.map(domain_list, & &1["domain"])
  end
end
