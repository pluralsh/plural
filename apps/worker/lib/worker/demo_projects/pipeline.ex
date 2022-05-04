defmodule Worker.DemoProjects.Pipeline do
  use Flow
  require Logger
  alias Core.Services.Shell.Demo

  def start_link(producer) do
    Flow.from_stages([producer], stages: 3, max_demand: 10)
    |> Flow.map(fn demo ->
      Logger.info "Processing demo project #{demo.id}"
      demo
    end)
    |> Flow.map(&Demo.delete_demo_project/1)
    |> Flow.start_link()
  end
end
