defmodule Core.Services.Dependencies do
  use Core.Services.Base
  alias Core.Schema.{
    TerraformInstallation,
    ChartInstallation,
    Dependencies,
    User
  }

  def valid?(nil, _), do: true
  def valid?(%Dependencies{dependencies: nil}, _), do: true
  def valid?(%Dependencies{dependencies: deps}, user) when is_list(deps),
    do: Enum.all?(deps, &valid?(&1, user))
  def valid?(%Dependencies.Dependency{type: :terraform, repo: repo, name: name}, %User{id: user_id}) do
    TerraformInstallation.for_repo_name(repo)
    |> TerraformInstallation.for_terraform_name(name)
    |> TerraformInstallation.for_user(user_id)
    |> Core.Repo.exists?()
  end
  def valid?(%Dependencies.Dependency{type: :helm, repo: repo, name: name}, %User{id: user_id}) do
    ChartInstallation.for_repo_name(repo)
    |> ChartInstallation.for_chart_name(name)
    |> ChartInstallation.for_user(user_id)
    |> Core.Repo.exists?()
  end
  def valid?(_, _), do: false

  def validate(nil, _), do: :pass
  def validate(%{dependencies: nil}, _), do: :pass
  def validate(%{dependencies: deps}, user) when is_list(deps),
    do: validate(deps, user)
  def validate([dep | rest], user) do
    case valid?(dep, user) do
      true -> validate(rest, user)
      false -> {:error, {:missing_dep, dep}}
    end
  end
  def validate([], _), do: :pass

  def pretty_print({:error, {:missing_dep, %{type: :terraform, repo: repo, name: name}}}),
    do: {:error, "Missing terraform module #{name} from repo #{repo}"}
  def pretty_print({:error, {:missing_dep, %{type: :helm, repo: repo, name: name}}}),
    do: {:error, "Missing helm chart #{name} from repo #{repo}"}

  defp extract_tar_file(tar, val_template) do
    case Enum.find(tar, &elem(&1, 0) == val_template) do
      {_, template} -> template
      _ -> nil
    end
  end

  def extract_dependencies(tar, filename) do
    with deps when is_binary(deps) <- extract_tar_file(tar, filename),
          {:ok, map} <- YamlElixir.read_from_string(deps) do
      {:ok, map}
    else
      {:error, _} = error -> error
      _ -> {:ok, nil}
    end
  end
end