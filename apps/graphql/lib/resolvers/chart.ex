defmodule GraphQl.Resolvers.Chart do
  use GraphQl.Resolvers.Base, model: Core.Schema.Chart
  alias Core.Services.Charts
  alias Core.Schema.{Version}

  def query(Version, _), do: Version
  def query(_, _), do: Chart
end