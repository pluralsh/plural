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
    field :integration_resource_definition, :resource_definition_attributes
    field :tags,          list_of(:tag_attributes)
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

  input_object :tag_attributes do
    field :tag, non_null(:string)
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
    field :type,          non_null(:type_input)
    field :name,          non_null(:string)
    field :default,       :string
    field :documentation, :string
    field :placeholder,   :string
  end

  enum :recipe_item_type_input do
    value :helm
    value :terraform
  end

  enum :type_input do
    value :int
    value :bool
    value :string
    value :object
  end

  input_object :integration_attributes do
    field :name,          non_null(:string)
    field :icon,          :upload_or_url
    field :source_url,    :string
    field :description,   :string
    field :spec,          :yml
    field :tags,          list_of(:tag_attributes)
  end

  input_object :resource_definition_attributes do
    field :name, non_null(:string)
    field :spec, list_of(:specification_attributes)
  end

  input_object :specification_attributes do
    field :name,     non_null(:string)
    field :type,     non_null(:type_input)
    field :spec,     list_of(:specification_attributes)
    field :required, :boolean
  end

  input_object :plan_attributes do
    field :name,       non_null(:string)
    field :cost,       non_null(:integer)
    field :period,     non_null(:string)
    field :defalt,     :boolean
    field :line_items, :plan_line_item_attributes
    field :metadata,   :plan_metadata_attributes
  end

  input_object :plan_metadata_attributes do
    field :freeform, :yml
    field :features, list_of(:plan_feature_attributes)
  end

  input_object :plan_feature_attributes do
    field :name,        non_null(:string)
    field :description, non_null(:string)
  end

  input_object :plan_line_item_attributes do
    field :included, list_of(:limit_attributes)
    field :items,    list_of(:line_item_attributes)
  end

  input_object :limit_attributes do
    field :dimension, non_null(:string)
    field :quantity,  non_null(:integer)
  end

  input_object :line_item_attributes do
    field :name,      non_null(:string)
    field :dimension, non_null(:string)
    field :cost,      non_null(:integer)
    field :period,    non_null(:string)
  end

  input_object :artifact_attributes do
    field :name,     non_null(:string)
    field :readme,   non_null(:string)
    field :type,     non_null(:string)
    field :platform, non_null(:string)
    field :blob,     :upload_or_url
  end

  input_object :subscription_attributes do
    field :line_items, :subscription_line_item_attributes
  end

  input_object :subscription_line_item_attributes do
    field :items, list_of(:limit_attributes)
  end
end