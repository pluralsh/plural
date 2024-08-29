defmodule Core.Schema.Validations do
  import Ecto.Changeset

  @url_regex ~r/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/

  def reject_urls(cs, field) do
    validate_change(cs, field, fn
      _, val when is_binary(val) ->
        case String.match?(val, @url_regex) do
          true -> [{field, "cannot contain urls"}]
          _ -> []
        end
      _, _ -> [{field, "must be a string"}]
    end)
  end
end
