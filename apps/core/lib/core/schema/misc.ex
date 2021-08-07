defmodule Core.Schema.DeviceLogin do
  defstruct [:device_token, :login_url]
end

defmodule Core.Schema.AuditContext do
  defstruct [:ip, :country, :city, :latitude, :longitude]
end
