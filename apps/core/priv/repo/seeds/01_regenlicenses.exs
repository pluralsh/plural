import Botanist

alias Core.Repo
alias Core.Schema.Repository

seed do
  Core.Repo.all(Repository)
  |> Enum.each(&Core.Services.Repositories.generate_keys/1)
end