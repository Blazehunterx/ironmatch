defmodule IronMatch.Schemas.UserProfile do
  @moduledoc """
  Ecto schema representing an IronMatch athlete profile, including their Big 4
  verified/estimated 1RMs, unit preference (`kg` / `lbs`), competitive tier,
  home gym facility, and RevenueCat Pro entitlement status.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "user_profiles" do
    field :name, :string
    field :email, :string
    field :role, :string, default: "athlete"
    field :home_gym, :string, default: "Iron Paradise HQ • Amsterdam"
    field :weight_unit, :string, default: "kg"
    field :bodyweight_kg, :float, default: 80.0

    # Big 4 1RM Benchmarks (stored in kg)
    field :squat_1rm, :float, default: 100.0
    field :bench_1rm, :float, default: 80.0
    field :deadlift_1rm, :float, default: 140.0
    field :ohp_1rm, :float, default: 50.0

    # Gamification & Streaks
    field :xp, :integer, default: 1_250
    field :streak_days, :integer, default: 4
    field :tier, :string, default: "Varsity"

    # Billing & Trial State
    field :is_pro, :boolean, default: false
    field :free_blueprints_remaining, :integer, default: 1

    timestamps(type: :utc_datetime)
  end

  def changeset(profile, attrs) do
    profile
    |> cast(attrs, [
      :name,
      :email,
      :role,
      :home_gym,
      :weight_unit,
      :bodyweight_kg,
      :squat_1rm,
      :bench_1rm,
      :deadlift_1rm,
      :ohp_1rm,
      :xp,
      :streak_days,
      :tier,
      :is_pro,
      :free_blueprints_remaining
    ])
    |> validate_required([:name, :weight_unit])
    |> validate_inclusion(:weight_unit, ["kg", "lbs"])
    |> validate_number(:squat_1rm, greater_than_or_equal_to: 0)
    |> validate_number(:bench_1rm, greater_than_or_equal_to: 0)
    |> validate_number(:deadlift_1rm, greater_than_or_equal_to: 0)
    |> validate_number(:ohp_1rm, greater_than_or_equal_to: 0)
  end
end
