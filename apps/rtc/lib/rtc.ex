defmodule Rtc do
  @moduledoc """
  Rtc keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  def conf(key), do: Application.get_env(:rtc, key)
end
