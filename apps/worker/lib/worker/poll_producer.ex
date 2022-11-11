defmodule Worker.PollProducer do
  defmacro __using__(opts \\ []) do
    state_keys = Keyword.get(opts, :state, [:demand, :draining])

    quote do
      use GenStage
      use Worker.Base
      require Logger

      defmodule State, do: defstruct unquote(state_keys)

      def handle_info(:poll, %State{draining: true} = state), do: drain(state) |> empty()
      def handle_info(:poll, %State{demand: 0} = state), do: drain(state) |> empty()
      def handle_info(:poll, %State{demand: demand} = state),
        do: deliver(demand, drain(state))

      def handle_demand(_, %State{draining: true} = state), do: drain(state) |> empty()
      def handle_demand(demand, %State{demand: remaining} = state) when demand > 0,
        do: deliver(demand + remaining, drain(state))

      def handle_demand(_, state), do: drain(state) |> empty()
    end
  end
end
