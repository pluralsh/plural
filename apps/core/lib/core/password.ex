defmodule Core.Password do
  @lower Enum.map(?a..?z, &to_string([&1]))
  @upper Enum.map(?A..?Z, &to_string([&1]))
  @digit Enum.map(?0..?9, &to_string([&1]))
  @other ~S"""
!"#$%&'()*+,-./:;<=>?@[]^_{|}~
""" |> String.codepoints |> List.delete_at(-1)
  @all @lower ++ @upper ++ @digit ++ @other

  def generate() do
    pswd = [Enum.random(@lower), Enum.random(@upper), Enum.random(@digit), Enum.random(@other)]
    generator(6, pswd)
  end

  def generator(0, pswd), do: Enum.shuffle(pswd) |> Enum.join()
  def generator(len, pswd), do: generator(len-1, [Enum.random(@all) | pswd])
end
