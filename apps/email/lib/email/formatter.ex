defimpl Bamboo.Formatter, for: Core.Schema.User do
  def format_email_address(user, _opts) do
    {user.name, user.email}
  end
end
