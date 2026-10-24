defmodule IronMatchWeb.OnboardingLive do
  @moduledoc """
  Phoenix LiveView for Frictionless Onboarding:
  - Top-level `Skip — I Just Want to Log a Workout ->` fast-track bypass
  - 1-Tap Beginner / Intermediate / Advanced Big 4 starting presets (`Not sure? Use safe starting weights`)
  - Instant `KG` / `LBS` unit toggle
  """
  use IronMatchWeb, :live_view

  @presets %{
    "beginner" => %{squat: 25.0, bench: 20.0, deadlift: 35.0, ohp: 15.0},
    "intermediate" => %{squat: 110.0, bench: 85.0, deadlift: 145.0, ohp: 52.5},
    "advanced" => %{squat: 175.0, bench: 130.0, deadlift: 215.0, ohp: 80.0}
  }

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     assign(socket,
       unit: :kg,
       selected_preset: "beginner",
       big4: @presets["beginner"]
     )}
  end

  @impl true
  def handle_event("apply_preset", %{"level" => level}, socket) do
    {:noreply, assign(socket, selected_preset: level, big4: Map.fetch!(@presets, level))}
  end

  @impl true
  def handle_event("toggle_unit", _params, socket) do
    new_unit = if socket.assigns.unit == :kg, do: :lbs, else: :kg
    {:noreply, assign(socket, unit: new_unit)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="space-y-5">
      <!-- Fast-Track Skip Banner (Persona 1 Jake Fix) -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-[#32FF32]">ZERO-FRICTION SETUP</span>
          <h1 class="text-lg font-black uppercase">CALIBRATE YOUR STRENGTH</h1>
        </div>
        <.link
          navigate={~p"/workouts"}
          class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-[#32FF32]/50 text-[10px] font-black uppercase text-[#32FF32]"
        >
          SKIP -> LOG WORKOUT
        </.link>
      </div>

      <!-- 1-Tap Experience Presets (Persona 3 Chloe Fix) -->
      <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase text-white">NOT SURE OF YOUR 1RMs?</span>
          <button phx-click="toggle_unit" class="text-[10px] font-black uppercase text-[#32FF32]">
            UNIT: <%= String.upcase(to_string(@unit)) %>
          </button>
        </div>
        <p class="text-xs text-zinc-400">
          Tap a preset below to auto-fill safe, realistic starting weights (Dumbbell & Goblet Squat friendly for beginners):
        </p>

        <div class="grid grid-cols-3 gap-2">
          <%= for {level, label} <- [{"beginner", "BEGINNER"}, {"intermediate", "INTERMEDIATE"}, {"advanced", "ADVANCED"}] do %>
            <button
              phx-click="apply_preset"
              phx-value-level={level}
              class={[
                "py-2 rounded-lg text-[11px] font-black uppercase border transition",
                if(@selected_preset == level,
                  do: "bg-[#32FF32] text-black border-[#32FF32]",
                  else: "bg-zinc-900 text-zinc-300 border-zinc-700"
                )
              ]}
            >
              <%= label %>
            </button>
          <% end %>
        </div>
      </div>

      <!-- Calibrated Big 4 Summary -->
      <div class="grid grid-cols-2 gap-2.5">
        <%= for {label, val} <- [{"Squat 1RM", @big4.squat}, {"Bench Press 1RM", @big4.bench}, {"Deadlift 1RM", @big4.deadlift}, {"Overhead Press 1RM", @big4.ohp}] do %>
          <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div class="text-[10px] font-bold uppercase text-zinc-400"><%= label %></div>
            <div class="text-lg font-black text-[#32FF32]">
              <%= if @unit == :lbs, do: round(val * 2.20462), else: val %> <%= @unit %>
            </div>
          </div>
        <% end %>
      </div>

      <.link
        navigate={~p"/workouts"}
        class="block w-full text-center py-3.5 rounded-xl bg-[#32FF32] text-black font-black text-xs uppercase tracking-wider"
      >
        GENERATE MY 8-WEEK BLUEPRINT ->
      </.link>
    </div>
    """
  end
end
