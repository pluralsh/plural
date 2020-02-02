defmodule Core.Schema.Email do
  use Piazza.Ecto.Schema

  defmodule Address do
    use Ecto.Type
    def type, do: :string

    def cast(%{"name" => name, "email" => address}),
      do: {:ok, {name, address}}
    def cast(%{"email" => email}), do: {:ok, {nil, email}}
    def cast(email) when is_binary(email), do: {:ok, {nil, email}}
    def cast(_), do: :error

    def load(data) do
      case String.split(data, ":") do
        [address] -> {:ok, {nil, address}}
        [name, address] -> {:ok, {name, address}}
        _ -> :error
      end
    end

    def dump({name, addr}) when not is_nil(name), do: {:ok, "#{name}:#{addr}"}
    def dump({_, addr}), do: {:ok, addr}
    def dump(addr) when is_binary(addr), do: {:ok, addr}
    def dump(_), do: :error
  end

  embedded_schema do
    field :to,        Address
    field :from,      Address
    field :subject,   :string
    field :html_body, :string
    field :text_body, :string
  end

  def bamboo(%__MODULE__{to: to, from: from, subject: subject, html_body: html_body, text_body: text_body}) do
    Bamboo.Email.new_email(
      to: to,
      from: from,
      subject: subject,
      html_body: html_body,
      text_body: text_body
    )
  end

  @valid ~w(to from subject html_body text_body)a

  def changeset(model, attrs \\ %{}) do
    model
    |> cast(attrs, @valid)
    |> validate_required([:to, :from])
    |> validate_one_present([:html_body, :text_body])
  end
end