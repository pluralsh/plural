defmodule GraphQl.Resolvers.User do
  use GraphQl.Resolvers.Base, model: Core.Schema.User
  alias Core.Services.Users
  alias Core.Schema.Repository

  def query(Repository, _), do: Repository
  def query(_, _), do: User
end