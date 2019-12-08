defmodule Core.Schema.License do
  @expiry 5

  @derive Jason.Encoder
  defstruct [:policy, :refresh_token, :expires_at]

  def new(attrs) do
    Map.new(attrs)
    |> Map.put(:expires_at, Timex.now() |> Timex.shift(days: @expiry))
    |> __struct__()
  end
end