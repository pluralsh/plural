defmodule GraphQl.Schema.Inputs do
  use Absinthe.Schema.Notation

  import_types Absinthe.Plug.Types
  import_types GraphQl.Schemas.Upload

  input_object :user_attributes do
    field :name, :string
    field :email, :string
    field :password, :string
  end

  input_object :publisher_attributes do
    field :name, :string
  end

  input_object :repository_attributes do
    field :name, :string
  end
end