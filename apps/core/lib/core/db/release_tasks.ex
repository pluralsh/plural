defmodule Core.DB.ReleaseTasks do

  @start_apps [
    :crypto,
    :ssl,
    :postgrex,
    :ecto,
    :hackney,
    :goth,
    :ecto_sql # If using Ecto 3.0 or higher
  ]

  @repos [Core.Repo]

  def migrate(_argv) do
    start_services()

    run_migrations()

    stop_services()
  end

  def seed(_argv) do
    start_services()

    run_migrations()

    run_seeds()

    stop_services()
  end

  def drop(_argv) do
    start_services()

    run_migrations(:down)

    stop_services()
  end

  defp start_services do
    IO.puts("Starting dependencies..")
    # Start apps necessary for executing migrations
    Enum.each(@start_apps, &Application.ensure_all_started/1)

    # Start the Repo(s) for app
    IO.puts("Starting repos..")

    # pool_size can be 1 for ecto < 3.0
    Enum.each(@repos, & &1.start_link(pool_size: 2))
  end

  defp stop_services do
    IO.puts("Success!")
    :init.stop()
  end

  defp run_migrations(direction \\ :up) do
    Enum.each(@repos, &run_migrations_for(&1, direction))
  end

  defp run_migrations_for(repo, direction) do
    app = Keyword.get(repo.config(), :otp_app)
    IO.puts("Running migrations for #{app}")
    migrations_path = priv_path_for(repo, "migrations")
    Ecto.Migrator.run(repo, migrations_path, direction, all: true)
  end

  # defp drop_db() do
  #   Enum.each(@repos, & &1.__adapter__.storage_down(&1.config))
  # end

  defp run_seeds do
    Enum.each(@repos, &run_seeds_for/1)
  end

  defp run_seeds_for(repo) do
    # Run the seed script if it exists
    seed_root = priv_path_for(repo, "seeds")

    seed_root
    |> File.ls()
    |> IO.inspect()
    |> case do
      {:ok, files} ->
        files
        |> Enum.map(&Path.join([seed_root, &1]))
        |> Enum.each(fn file ->
          IO.puts "Running seed for #{file}"
          Code.eval_file(file)
        end)
      {:error, _} -> IO.puts "No seeds to run"
    end
  end

  defp priv_path_for(repo, filename) do
    app = Keyword.get(repo.config(), :otp_app)

    repo_underscore =
      repo
      |> Module.split()
      |> List.last()
      |> Macro.underscore()

    priv_dir = "#{:code.priv_dir(app)}"

    Path.join([priv_dir, repo_underscore, filename])
  end
end