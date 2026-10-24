defmodule IronMatchWeb.SocialHubLive do
  @moduledoc """
  Phoenix LiveView for the Unified Home Social Feed + Live Gym Floor Radar.
  Supports Facility vs. Global feed filtering, Live Spotter Beacons, and
  1-Tap Fist-Bump / Partner Request interactions.
  """
  use IronMatchWeb, :live_view
  alias IronMatch.Arena.MatchmakerServer

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(IronMatch.PubSub, "arena:global")
      Phoenix.PubSub.subscribe(IronMatch.PubSub, "feed:global")
    end

    arena = MatchmakerServer.get_arena_state()

    initial_posts = [
      %{
        id: "post_1",
        author: "Marcus Vance",
        tier: "Titan",
        facility: "Iron Paradise HQ • Amsterdam",
        scope: "facility",
        lift_summary: "Barbell Back Squat • 210kg × 3 @ RPE 8.5",
        caption: "Depth checked. Seeking a heavy pull partner this Friday 18:00.",
        fist_bumps: 18
      },
      %{
        id: "post_2",
        author: "Elena Rostova",
        tier: "Vanguard",
        facility: "Iron Paradise HQ • Amsterdam",
        scope: "facility",
        lift_summary: "Conventional Deadlift • 165kg × 5 (PR)",
        caption: "Hook grip held solid through all 5 reps.",
        fist_bumps: 24
      },
      %{
        id: "post_3",
        author: "Priya Nair",
        tier: "Contender",
        facility: "Blacksmith Barbell • Rotterdam",
        scope: "global",
        lift_summary: "Combat Physio Swap -> Neutral-Grip DB Bench 24kg × 8",
        caption: "Zero anterior shoulder pinch today thanks to the neutral-grip swap.",
        fist_bumps: 11
      }
    ]

    {:ok,
     assign(socket,
       arena: arena,
       posts: initial_posts,
       scope_filter: "all",
       spotter_beacon_active: false
     )}
  end

  @impl true
  def handle_event("toggle_beacon", _params, socket) do
    {:ok, arena} =
      MatchmakerServer.toggle_spotter_beacon("usr_you", "Barbell Bench Press • 105kg Top Set")

    {:noreply, assign(socket, arena: arena, spotter_beacon_active: !socket.assigns.spotter_beacon_active)}
  end

  @impl true
  def handle_event("set_scope", %{"scope" => scope}, socket) do
    {:noreply, assign(socket, scope_filter: scope)}
  end

  @impl true
  def handle_event("fist_bump", %{"id" => post_id}, socket) do
    updated =
      Enum.map(socket.assigns.posts, fn p ->
        if p.id == post_id, do: %{p | fist_bumps: p.fist_bumps + 1}, else: p
      end)

    {:noreply, assign(socket, posts: updated)}
  end

  @impl true
  def handle_info({:arena_updated, arena}, socket) do
    {:noreply, assign(socket, arena: arena)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="space-y-4">
      <!-- Facility Header & Spotter Beacon -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-[#32FF32]">LIVE GYM FLOOR RADAR</span>
          <h1 class="text-base font-black uppercase"><%= @arena.gym_name %></h1>
        </div>
        <button
          phx-click="toggle_beacon"
          class={[
            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition",
            if(@spotter_beacon_active,
              do: "bg-red-500 text-white border-red-400 animate-pulse",
              else: "bg-zinc-900 text-[#32FF32] border-[#32FF32]/40"
            )
          ]}
        >
          <%= if @spotter_beacon_active, do: "SPOTTER BEACON LIVE", else: "REQUEST SPOTTER" %>
        </button>
      </div>

      <!-- Live Gym Floor Roster -->
      <div class="space-y-2">
        <div class="text-[10px] font-black uppercase tracking-wider text-zinc-400">
          ON THE FLOOR RIGHT NOW (<%= length(@arena.live_roster) %> ACTIVE)
        </div>
        <div class="space-y-2">
          <%= for athlete <- @arena.live_roster do %>
            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-white"><%= athlete.name %></span>
                  <.tier_badge tier={athlete.tier} />
                  <%= if athlete.spotter_needed do %>
                    <span class="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-black uppercase">
                      NEEDS SPOT
                    </span>
                  <% end %>
                </div>
                <div class="text-[11px] text-zinc-400"><%= athlete.current_exercise %></div>
              </div>
              <.link
                navigate={~p"/messages"}
                class="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#32FF32] hover:text-black text-[10px] font-black uppercase transition"
              >
                TRAIN / SPOT
              </.link>
            </div>
          <% end %>
        </div>
      </div>

      <!-- Feed Scope Filter -->
      <div class="flex items-center justify-between pt-2">
        <span class="text-xs font-black uppercase text-zinc-400">VERIFIED LIFT FEED</span>
        <div class="flex gap-1.5">
          <%= for {scope, label} <- [{"all", "ALL"}, {"facility", "MY GYM"}] do %>
            <button
              phx-click="set_scope"
              phx-value-scope={scope}
              class={[
                "px-2.5 py-1 rounded text-[10px] font-black uppercase",
                if(@scope_filter == scope, do: "bg-[#32FF32] text-black", else: "bg-zinc-900 text-zinc-400")
              ]}
            >
              <%= label %>
            </button>
          <% end %>
        </div>
      </div>

      <!-- Feed Cards -->
      <div class="space-y-3">
        <%= for post <- Enum.filter(@posts, &(@scope_filter == "all" or &1.scope == @scope_filter)) do %>
          <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-white"><%= post.author %></span>
                <.tier_badge tier={post.tier} />
              </div>
              <span class="text-[10px] text-zinc-500"><%= post.facility %></span>
            </div>
            <div class="p-2.5 rounded-lg bg-black/60 border border-zinc-800 text-xs font-black text-[#32FF32]">
              <%= post.lift_summary %>
            </div>
            <p class="text-xs text-zinc-300"><%= post.caption %></p>
            <div class="flex items-center justify-between pt-1">
              <button
                phx-click="fist_bump"
                phx-value-id={post.id}
                class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black text-[#32FF32]"
              >
                RESPECT • <%= post.fist_bumps %>
              </button>
              <.link navigate={~p"/messages"} class="text-[10px] font-bold text-zinc-400 hover:text-white uppercase">
                MESSAGE ATHLETE ->
              </.link>
            </div>
          </div>
        <% end %>
      </div>
    </div>
    """
  end
end
