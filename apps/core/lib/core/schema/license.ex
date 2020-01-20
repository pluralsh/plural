defmodule Core.Schema.License do
  @expiry 5

  defmodule Policy do
    @derive Jason.Encoder
    defstruct [:features, :limits, :free]

    def new(attrs), do: Map.new(attrs) |> __struct__()
  end

  @derive Jason.Encoder
  defstruct [:policy, :refresh_token, :expires_at]

  def new(attrs) do
    Map.new(attrs)
    |> Map.put(:expires_at, Timex.now() |> Timex.shift(days: @expiry))
    |> Map.update(:policy, %Policy{free: true}, &Policy.new/1)
    |> __struct__()
  end
end