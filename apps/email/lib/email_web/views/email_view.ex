defmodule EmailWeb.EmailView do
  use EmailWeb, :view

  def url(path), do: "#{Email.conf(:host)}#{path}"
end
