defmodule IronMatchWeb.Presence do
  @moduledoc """
  Distributed CRDT `Phoenix.Presence` tracker for the Live Gym Floor Radar.
  Tracks which athletes are currently on the gym floor, their active exercise,
  and whether their Spotter Needed beacon is active.
  """
  use Phoenix.Presence,
    otp_app: :iron_match,
    pubsub_server: IronMatch.PubSub
end
