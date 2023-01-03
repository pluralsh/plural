defprotocol GraphQl.ExceptionHandler do
  @fallback_to_any true
  def message(struct)

  def capture(struct)
end

defimpl GraphQl.ExceptionHandler, for: Ecto.NoResultsError do
  def message(_), do: "that resource was not found"

  def capture(_), do: false
end

defimpl GraphQl.ExceptionHandler, for: FunctionClauseError do
  def message(_), do: "invalid argument"

  def capture(_), do: true
end

defimpl GraphQl.ExceptionHandler, for: Any do
  def message(_), do: "unknown error"

  def capture(_), do: true
end
