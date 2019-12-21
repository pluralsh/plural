defmodule GraphQl.Schema.Inputs do
  use Absinthe.Schema.Notation

  import_types Absinthe.Plug.Types
  import_types GraphQl.Schemas.Upload

  input_object :user_attributes do
    field :name,     :string
    field :email,    :string
    field :password, :string
    field :avatar,   :upload_or_url
  end

  input_object :publisher_attributes do
    field :name,        :string
    field :description, :string
    field :avatar,      :upload_or_url
  end

  input_object :repository_attributes do
    field :name,          :string
    field :description,   :string
    field :documentation, :string
    field :icon,          :upload_or_url
  end

  input_object :installation_attributes do
    field :context,      :yml
    field :auto_upgrade, :boolean
  end

  input_object :terraform_attributes do
    field :name,         :string
    field :description,  :string
    field :package,      :upload_or_url
    field :dependencies, :yml
  end

  input_object :chart_installation_attributes do
    field :chart_id,   :id
    field :version_id, :id
  end

  input_object :terraform_installation_attributes do
    field :terraform_id, :id
  end

  input_object :webhook_attributes do
    field :url, non_null(:string)
  end

  enum :provider_input do
    value :aws
    value :gcp
    value :azure
  end

  input_object :recipe_attributes do
    field :name,        non_null(:string)
    field :description, :string
    field :provider,    :provider_input
    field :sections,    list_of(:recipe_section_attributes)
  end

  input_object :recipe_section_attributes do
    field :name,  non_null(:string)
    field :items, list_of(:recipe_item_attributes)
  end

  input_object :recipe_item_attributes do
    field :name,          non_null(:string)
    field :type,          non_null(:recipe_item_type_input)
    field :configuration, list_of(:recipe_configuration_attributes)
  end


  input_object :recipe_configuration_attributes do
    field :type,          non_null(:recipe_configuration_type_input)
    field :name,          non_null(:string)
    field :default,       :string
    field :documentation, :string
    field :placeholder,   :string
  end

  enum :recipe_item_type_input do
    value :helm
    value :terraform
  end

  enum :recipe_configuration_type_input do
    value :int
    value :bool
    value :string
  end
end