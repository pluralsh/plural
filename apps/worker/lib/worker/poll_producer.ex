defmodule Worker.PollProducer do
  defmacro __using__(opts \\ []) do
    state_keys = Keyword.get(opts, :state, [:demand, :draining])

    quote do
      use GenStage
      use Worker.Base
      require Logger

      defmodule State, do: defstruct unquote(state_keys)

      def handle_info(:poll, %State{draining: true} = state), do: empty(state) |> drain()
      def handle_info(:poll, %State{demand: 0} = state), do: empty(state) |> drain()
      def handle_info(:poll, %State{demand: demand} = state),
        do: deliver(demand, drain(state))

      def handle_demand(_, %State{draining: true} = state), do: empty(state) |> drain()
      def handle_demand(demand, %State{demand: remaining} = state) when demand > 0,
        do: deliver(demand + remaining, drain(state))

      def handle_demand(_, state), do: empty(state) |> drain()

      defp drain(state), do: %{state | draining: FT.K8S.TrafficDrainHandler.draining?()}

      defp demand(state, d, v) when is_integer(v), do: %{state | demand: d - v}
      defp demand(state, d, l) when is_list(l), do: %{state | demand: d - length(l)}
    end
  end
end
