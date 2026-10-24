defmodule IronMatchWeb.UserSocket do
  use Phoenix.Socket

  channel "gym_radar:*", IronMatchWeb.GymRadarChannel

  @impl true
  def connect(params, socket, _connect_info) do
    user_id = Map.get(params, "user_id", "athlete_#{System.unique_integer([:positive])}")
    {:ok, assign(socket, :user_id, user_id)}
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end

defmodule IronMatchWeb.GymRadarChannel do
  @moduledoc """
  Real-time Phoenix Channel + `Phoenix.Presence` for the Live Gym Floor Radar.
  Broadcasts active exercises, Spotter Needed emergency beacons, and 1-tap fist-bumps.
  """
  use IronMatchWeb, :channel
  alias IronMatchWeb.Presence

  @impl true
  def join("gym_radar:" <> facility_id, payload, socket) do
    send(self(), {:after_join, facility_id, payload})
    {:ok, assign(socket, :facility_id, facility_id)}
  end

  @impl true
  def handle_info({:after_join, _facility_id, payload}, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        name: Map.get(payload, "name", "Athlete"),
        tier: Map.get(payload, "tier", "Varsity"),
        current_exercise: Map.get(payload, "current_exercise", "Warm-up"),
        spotter_needed: Map.get(payload, "spotter_needed", false),
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_in("spotter_beacon", %{"exercise" => exercise, "weight" => weight}, socket) do
    broadcast!(socket, "spotter_alert", %{
      user_id: socket.assigns.user_id,
      exercise: exercise,
      weight: weight,
      timestamp: System.system_time(:second)
    })

    {:reply, :ok, socket}
  end
end
