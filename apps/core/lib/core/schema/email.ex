defmodule Core.Schema.Email do
  use Piazza.Ecto.Schema

  embedded_schema do
    field :to,        :string
    field :from,      :string
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