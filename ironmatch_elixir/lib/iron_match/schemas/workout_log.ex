defmodule IronMatch.Schemas.WorkoutLog do
  @moduledoc """
  Ecto schema for persisted workout sessions, storing exercises and completed sets
  as structured embedded JSON maps alongside total tonnage and PR achievements.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "workout_logs" do
    field :user_id, :binary_id
    field :title, :string
    field :day_id, :string
    field :difficulty_mode, :string, default: "target"
    field :duration_seconds, :integer, default: 0
    field :total_tonnage_kg, :float, default: 0.0
    field :exercises, {:array, :map}, default: []
    field :new_prs, {:array, :map}, default: []

    timestamps(type: :utc_datetime)
  end

  def changeset(log, attrs) do
    log
    |> cast(attrs, [
      :user_id,
      :title,
      :day_id,
      :difficulty_mode,
      :duration_seconds,
      :total_tonnage_kg,
      :exercises,
      :new_prs
    ])
    |> validate_required([:title, :exercises])
  end
end
