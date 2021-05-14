defmodule Core.Docker.TrivySource do
  use Core.Docker.VulnerabilitySource

  deffetch "VulnerabilityID",  :vulnerability_id
  deffetch "PkgName",          :package
  deffetch "InstalledVersion", :installed_version
  deffetch "FixedVersion",     :fixed_version
  deffetch "SeveritySource",   :source, resolve: &default(&1, "redhat")
  deffetch "PrimaryURL",       :url
  deffetch "Title",            :title
  deffetch "Description",      :description, resolve: &truncate(&1, 700)
  deffetch "Severity",         :severity, resolve: &grade/1
  deffetch "Layer",            :layer, resolve: fn %{"Digest" => digest, "DiffID" => diff} -> %{digest: digest, diff_id: diff} end

  def __field__(payload, :cvss) do
    case get_cvss(payload) do
      %{"V3Vector" => v} when is_binary(v) -> parse_v3_vector(v)
      _ -> nil
    end
  end

  def __field__(payload, :score) do
    get_cvss(payload)
    |> Map.get("V3Score")
  end

  def get_cvss(%{"SeveritySource" => source, "CVSS" => cvss}), do: Map.get(cvss, source)
  def get_cvss(%{"CVSS" => %{"redhat" => redhat}}), do: redhat
end
