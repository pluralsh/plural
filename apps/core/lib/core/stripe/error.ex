defimpl String.Chars, for: Stripe.Error do
  def to_string(%Stripe.Error{user_message: message}) when is_binary(message), do: message
  def to_string(%Stripe.Error{message: message}) when is_binary(message), do: message
  def to_string(%Stripe.Error{}), do: "Stripe request failed"
end
