defmodule Email do
  @moduledoc """
  Email keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  def conf(key, default \\ nil), do: Application.get_env(:email, key, default)
end
