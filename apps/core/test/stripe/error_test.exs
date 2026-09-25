defmodule Core.Stripe.ErrorTest do
  use ExUnit.Case, async: true

  test "uses Stripe's user-facing message when present" do
    error = %Stripe.Error{
      source: :stripe,
      code: :card_error,
      message: "Internal Stripe message",
      user_message: "Your card was declined"
    }

    assert to_string(error) == "Your card was declined"
  end

  test "uses the diagnostic message for network errors" do
    error = Stripe.Error.from_hackney_error(:protocol_error)

    assert to_string(error) ==
             "An error occurred while making the network request. " <>
               "The HTTP client returned the following reason: :protocol_error"
  end

  test "returns a safe fallback when Stripe provides no message" do
    error = %Stripe.Error{source: :network, code: :network_error, message: nil}

    assert to_string(error) == "Stripe request failed"
  end
end
