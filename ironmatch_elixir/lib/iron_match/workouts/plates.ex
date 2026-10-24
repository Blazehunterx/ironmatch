defmodule IronMatch.Workouts.Plates do
  @moduledoc """
  Olympic Barbell Plate Calculator & Breakdown Engine supporting `:kg` and `:lbs`.
  """

  @bar_weights %{
    ez: %{kg: 10.0, lbs: 25.0, label_kg: "EZ 10KG", label_lbs: "EZ 25LB"},
    women: %{kg: 15.0, lbs: 35.0, label_kg: "15KG", label_lbs: "35LB"},
    men: %{kg: 20.0, lbs: 45.0, label_kg: "OLYMPIC 20KG", label_lbs: "OLYMPIC 45LB"},
    ssb: %{kg: 25.0, lbs: 55.0, label_kg: "SSB 25KG", label_lbs: "SSB 55LB"}
  }

  @plates_kg [
    %{weight: 25.0, color: "#EF4444", height: 110, width: 14, label: "25kg"},
    %{weight: 20.0, color: "#3B82F6", height: 110, width: 13, label: "20kg"},
    %{weight: 15.0, color: "#EAB308", height: 96, width: 11, label: "15kg"},
    %{weight: 10.0, color: "#22C55E", height: 84, width: 10, label: "10kg"},
    %{weight: 5.0, color: "#F8FAFC", height: 68, width: 8, label: "5kg"},
    %{weight: 2.5, color: "#94A3B8", height: 56, width: 7, label: "2.5kg"},
    %{weight: 1.25, color: "#64748B", height: 46, width: 6, label: "1.25kg"}
  ]

  @plates_lbs [
    %{weight: 45.0, color: "#3B82F6", height: 110, width: 14, label: "45lbs"},
    %{weight: 35.0, color: "#EAB308", height: 96, width: 12, label: "35lbs"},
    %{weight: 25.0, color: "#22C55E", height: 84, width: 11, label: "25lbs"},
    %{weight: 10.0, color: "#F8FAFC", height: 68, width: 9, label: "10lbs"},
    %{weight: 5.0, color: "#94A3B8", height: 56, width: 7, label: "5lbs"},
    %{weight: 2.5, color: "#64748B", height: 46, width: 6, label: "2.5lbs"}
  ]

  def bar_weights, do: @bar_weights

  @doc """
  Computes the exact plates per side and any unloadable remainder for `total_weight`, `bar_type`, and `unit`.
  """
  def calculate_per_side(total_weight, bar_type \\ :men, unit \\ :kg) do
    u = if unit in [:lbs, "lbs"], do: :lbs, else: :kg
    bar_spec = Map.get(@bar_weights, bar_type, @bar_weights.men)
    bar_weight = Map.get(bar_spec, u)
    available_plates = if u == :lbs, do: @plates_lbs, else: @plates_kg

    per_side_target = max(0.0, (total_weight - bar_weight) / 2.0)

    {plates, remainder} =
      Enum.reduce(available_plates, {[], per_side_target}, fn spec, {acc, rem_w} ->
        count = trunc(Float.floor((rem_w + 0.001) / spec.weight))

        if count > 0 do
          added = List.duplicate(spec, count)
          {acc ++ added, Float.round(rem_w - count * spec.weight, 2)}
        else
          {acc, rem_w}
        end
      end)

    summary =
      plates
      |> Enum.frequencies_by(& &1.label)
      |> Enum.map(fn {label, count} -> "#{count}x #{label}" end)
      |> case do
        [] -> "Empty bar"
        list -> Enum.join(list, " + ") <> " per side"
      end

    %{
      unit: u,
      bar_type: bar_type,
      bar_weight: bar_weight,
      total_weight: max(bar_weight, total_weight * 1.0),
      plates_per_side: plates,
      remainder_per_side: remainder,
      summary: summary
    }
  end
end
