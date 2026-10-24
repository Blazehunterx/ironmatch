defmodule IronMatch.Schemas.Duel do
  @moduledoc """
  Ecto schema for 1v1 Ranked Strength Duels & Asynchronous Ghost Duels.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "duels" do
    field :challenger_name, :string
    field :opponent_name, :string
    field :lift_category, :string
    field :wager_xp, :integer, default: 250
    field :challenger_score, :float, default: 0.0
    field :opponent_score, :float, default: 0.0
    field :status, :string, default: "active"

    timestamps(type: :utc_datetime)
  end

  def changeset(duel, attrs) do
    duel
    |> cast(attrs, [
      :challenger_name,
      :opponent_name,
      :lift_category,
      :wager_xp,
      :challenger_score,
      :opponent_score,
      :status
    ])
    |> validate_required([:challenger_name, :opponent_name, :lift_category])
  end
end
