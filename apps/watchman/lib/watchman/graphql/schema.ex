defmodule Watchman.GraphQl.Schema do
  use Watchman.GraphQl.Schema.Base
  alias Watchman.GraphQl.Resolvers.Build
  import_types Absinthe.Plug.Types

  ## ENUMS

  enum :status do
    value :queued
    value :running
    value :successful
    value :failed
  end

  enum :build_type do
    value :deploy
    value :bounce
  end

  ## INPUTS

  input_object :build_attributes do
    field :repository, non_null(:string)
    field :type,       :build_type
    field :message,    :string
  end

  ## OBJECTS

  object :build do
    field :id,           non_null(:id)
    field :repository,   non_null(:string)
    field :type,         non_null(:build_type)
    field :status,       non_null(:status)
    field :message,      :string
    field :completed_at, :datetime

    connection field :commands, node_type: :command do
      resolve &Build.list_commands/2
    end

    timestamps()
  end

  object :command do
    field :id,           non_null(:id)
    field :command,      non_null(:string)
    field :exit_code,    :integer
    field :stdout,       :string
    field :completed_at, :datetime
    field :build,        :build, resolve: dataloader(Build)

    timestamps()
  end

  object :installation do
    field :id, non_null(:id)
    field :repository, :repository
  end

  object :repository do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :description, :string
  end

  delta :build
  delta :command

  connection node_type: :build
  connection node_type: :command
  connection node_type: :installation
end