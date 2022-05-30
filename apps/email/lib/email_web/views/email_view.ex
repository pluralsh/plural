defmodule EmailWeb.EmailView do
  use EmailWeb, :view

  def url(path), do: "#{Email.conf(:host)}#{path}"

  def row(assigns \\ %{}, do: block), do: render_template("row.html", assigns, block)

  def text(assigns \\ %{}, do: block), do: render_template("text.html", assigns, block)

  def btn(assigns \\ %{}, do: block), do: render_template("button.html", assigns, block)

  def space(assigns \\ %{}), do: EmailWeb.SharedView.render("space.html", Map.new(assigns))

  defp render_template(template, assigns, block) do
    assigns =
      assigns
      |> Map.new()
      |> Map.put(:inner_content, block)

    EmailWeb.SharedView.render(template, assigns)
  end
end
