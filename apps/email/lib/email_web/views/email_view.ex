defmodule EmailWeb.EmailView do
  use EmailWeb, :view
  alias Core.Schema.Repository

  def url(path), do: "#{Email.conf(:host)}#{path}"

  def row(assigns \\ %{}, do: block), do: render_template("row.html", assigns, block)

  def text(assigns \\ %{}, do: block), do: render_template("text.html", assigns, block)

  def btn(assigns \\ %{}, do: block), do: render_template("button.html", assigns, block)

  def space(assigns \\ %{}), do: EmailWeb.SharedView.render("space.html", Map.new(assigns))

  def repo_img_url(%Repository{dark_icon: icon} = repo) when is_binary(icon),
    do: Core.Storage.url({repo.dark_icon, repo}, :original)
  def repo_img_url(%Repository{icon: icon} = repo) when is_binary(icon),
    do: Core.Storage.url({repo.icon, repo}, :original)
  def repo_img_url(_), do: nil

  def repo_img(assigns \\ %{}) do
    %{repo: repo} = assigns = Map.new(assigns) |> img_defaults()
    case repo_img_url(repo) do
      url when is_binary(url) ->
        EmailWeb.SharedView.render("image.html", Map.put(assigns, :url, url))
      _ -> ""
    end
  end

  def img_url(item, key), do: Core.Storage.url({Map.get(item, key), item}, :original)

  def img(assigns \\ %{}) do
    assigns =
      Map.new(assigns)
      |> img_defaults()
      |> Map.put(:url, img_url(assigns[:item], assigns[:key]))
    EmailWeb.SharedView.render("image.html", assigns)
  end

  defp img_defaults(assigns) do
    Map.put_new(assigns, :width, 50)
    |> Map.put_new(:height, 50)
  end

  defp render_template(template, assigns, block) do
    assigns =
      assigns
      |> Map.new()
      |> Map.put(:inner_content, block)

    EmailWeb.SharedView.render(template, assigns)
  end
end
