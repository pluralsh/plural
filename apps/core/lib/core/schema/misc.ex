defmodule Core.Schema.DeviceLogin do
  defstruct [:device_token, :login_url]
end

defmodule Core.Schema.AuditContext do
  defstruct [:ip, :country, :city, :latitude, :longitude]
end

defmodule Core.Scan.Error do
  defstruct [:errMsg]
end

defmodule Core.Scan.Violation do
  defstruct [
    :rule_name,
    :description,
    :rule_id,
    :severity,
    :category,
    :resource_name,
    :resource_type,
    :file,
    :line
  ]
end


defmodule Core.Scan.Summary do
  defstruct [:low, :medium, :high]
end

defmodule Core.Scan.Results do
  defstruct [:scan_errors, :violations, :scan_summary]
end


defmodule Core.Scan do
  defstruct [:results]

  def type() do
    %__MODULE__{
      results: %Core.Scan.Results{
        scan_errors: [%Core.Scan.Error{}],
        violations: [%Core.Scan.Violation{}],
        scan_summary: %Core.Scan.Summary{}
      },
    }
  end
end
