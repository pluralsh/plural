defmodule ApiWeb.FallbackController do
  use Phoenix.Controller

  def call(conn, {:error, error}) do
    {error, msg} = error(error)

    conn
    |> put_status(error)
    |> json(%{message: msg})
  end

  def error(:invalid_password), do: {401, "Invalid Password"}
  def error(:not_found), do: {404, "Not Found"}
  def error(:forbidden), do: {403, "You're not allowed to access that resource"}
  def error(%Ecto.Changeset{} = cs), do: {422, format_changeset(cs)}

  defp format_changeset(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end