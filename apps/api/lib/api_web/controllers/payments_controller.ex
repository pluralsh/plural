defmodule ApiWeb.PaymentsController do
  use ApiWeb, :controller
  alias Core.Services.Payments

  plug ApiWeb.Plugs.LicenseAuthorizer

  def usage_record(conn, %{"dimension" => dimension, "quantity" => q}) do
    %{installation: inst} = Core.Repo.preload(conn.assigns.license_token, [installation: :subscription])

    with {:ok, _} <- Payments.add_usage_record(%{quantity: q}, dimension, inst.subscription) do
      json(conn, %{ok: true})
    end
  end
end
