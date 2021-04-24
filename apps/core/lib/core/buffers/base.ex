defmodule Core.Buffer.Base do
  defmacro __using__(opts) do
    lifespan = Keyword.get(opts, :lifespan, 60_000)
    state = Keyword.get(opts, :state, & &1)
    quote do
      use GenServer
      require Logger

      def start_link(opts \\ []) do
        GenServer.start_link(__MODULE__, opts)
      end

      def start(opts \\ []) do
        GenServer.start(__MODULE__, opts)
      end

      def init(opts) do
        Logger.info "Creating buffer #{__MODULE__}"
        Process.send_after(self(), :flush, unquote(lifespan))
        {:ok, unquote(state).(opts), 0}
      end

      def submit(pid \\ __MODULE__, job), do: GenServer.call(pid, {:submit, job})
    end
  end
end
