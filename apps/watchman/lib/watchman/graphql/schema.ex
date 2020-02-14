defmodule Watchman.GraphQl.Schema do
  use Watchman.GraphQl.Schema.Base
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
    field :type, :build_type
  end

  ## OBJECTS

  object :build do
    field :id,           non_null(:id)
    field :repository,   non_null(:string)
    field :type,         non_null(:build_type)
    field :status,       non_null(:status)
    field :completed_at, :datetime

    timestamps()
  end

  delta :build

  connection node_type: :build
end