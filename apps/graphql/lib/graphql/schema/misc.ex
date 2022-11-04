defmodule GraphQl.Schema.Misc do
  use GraphQl.Schema.Base

  import_types Absinthe.Type.Custom
  import_types GraphQl.Schema.CustomTypes

  enum :delta do
    value :create
    value :update
    value :delete
  end

  enum :direction do
    value :before
    value :after
  end

  enum :order do
    value :asc
    value :desc
  end

  input_object :tag_attributes do
    field :tag, non_null(:string)
  end

  object :closure_item do
    field :helm,      :chart
    field :terraform, :terraform
    field :dep,       :dependency
  end

  object :tag do
    field :id,  non_null(:id)
    field :tag, non_null(:string)
  end

  enum :tag_group do
    value :integrations
    value :repositories
  end

  object :grouped_tag do
    field :tag,   non_null(:string)
    field :count, non_null(:integer)
  end

  object :file_content do
    field :path,    non_null(:string)
    field :content, non_null(:string)
  end

  object :plural_configuration do
    field :stripe_connect_id,      :string
    field :stripe_publishable_key, :string
    field :registry,               :string
    field :git_commit,             :string
  end

  connection node_type: :grouped_tag
end
