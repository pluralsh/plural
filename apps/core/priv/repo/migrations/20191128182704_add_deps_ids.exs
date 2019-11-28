defmodule Core.Repo.Migrations.AddDepsIds do
  use Ecto.Migration

  def change do
    uuid = Ecto.UUID.generate()
    execute("""
      update terraform
      set dependencies = jsonb_set(dependencies, '{id}', to_jsonb('#{uuid}'::uuid))
      where dependencies->'id' is null
    """)
  end
end
