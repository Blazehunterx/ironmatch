defmodule IronMatchWeb.ArenaLive do
  @moduledoc """
  Phoenix LiveView for the Competitive Arena:
  - Unified 6-Tier Vector Shield Badge + Tactical `BP / SQ / DL / OHP` pills
  - Real-time Ranked Duels & Ghost Duels (`MatchmakerServer`)
  - Tactical Squads + Global Daily Whiteboard WOD & Leaderboard
  - Inter-Gym Tonnage Wars & Weekly Quests
  """
  use IronMatchWeb, :live_view
  alias IronMatch.Arena.MatchmakerServer
  alias IronMatch.Gamification

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(IronMatch.PubSub, "arena:global")
    end

    arena = MatchmakerServer.get_arena_state()
    big4 = %{squat: 140.0, bench: 105.0, deadlift: 180.0, ohp: 65.0}
    sbd_total = Gamification.calculate_sbd_total(big4.squat, big4.bench, big4.deadlift)
    tier_info = Gamification.tier_for_total(sbd_total, :kg)

    {:ok,
     assign(socket,
       arena: arena,
       big4: big4,
       sbd_total: sbd_total,
       tier_info: tier_info,
       active_tab: "duels"
     )}
  end

  @impl true
  def handle_event("switch_tab", %{"tab" => tab}, socket) do
    {:noreply, assign(socket, active_tab: tab)}
  end

  @impl true
  def handle_event("quick_duel", _params, socket) do
    {:ok, arena} =
      MatchmakerServer.create_duel("You", "Elena Rostova", "Squat Relative BWx Duel", 300)

    {:noreply, assign(socket, arena: arena)}
  end

  @impl true
  def handle_event("toggle_squad", %{"id" => squad_id}, socket) do
    {:ok, arena} = MatchmakerServer.join_squad(squad_id, "You")
    {:noreply, assign(socket, arena: arena)}
  end

  @impl true
  def handle_event("log_wod_score", %{"squad_id" => squad_id}, socket) do
    {:ok, arena} =
      MatchmakerServer.submit_whiteboard_score(squad_id, "You", "140kg × 3 (Verified)")

    {:noreply, assign(socket, arena: arena)}
  end

  @impl true
  def handle_info({:arena_updated, arena}, socket) do
    {:noreply, assign(socket, arena: arena)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="space-y-4">
      <!-- Tactical Arena Header (Zero Cartoon Emojis) -->
      <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400">VERIFIED SBD TOTAL</div>
            <div class="text-2xl font-black text-white"><%= round(@sbd_total) %> KG</div>
          </div>
          <.tier_badge tier={@tier_info.name} />
        </div>

        <!-- Tactical Vector Lift Pills (BP, SQ, DL, OHP) -->
        <div class="grid grid-cols-4 gap-2 pt-1">
          <%= for {code, val} <- [{"SQ", @big4.squat}, {"BP", @big4.bench}, {"DL", @big4.deadlift}, {"OHP", @big4.ohp}] do %>
            <div class="p-2 rounded-lg bg-black/60 border border-zinc-800 text-center">
              <div class="text-[10px] font-black text-[#32FF32]"><%= code %></div>
              <div class="text-xs font-bold text-white"><%= round(val) %>kg</div>
            </div>
          <% end %>
        </div>
      </div>

      <!-- Sub-Navigation Tabs -->
      <div class="grid grid-cols-4 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        <%= for {id, label} <- [{"duels", "DUELS"}, {"squads", "SQUADS"}, {"gym_wars", "GYM WARS"}, {"quests", "QUESTS"}] do %>
          <button
            phx-click="switch_tab"
            phx-value-tab={id}
            class={[
              "py-1.5 rounded-lg text-[10px] font-black uppercase transition",
              if(@active_tab == id, do: "bg-[#32FF32] text-black", else: "text-zinc-400")
            ]}
          >
            <%= label %>
          </button>
        <% end %>
      </div>

      <%= case @active_tab do %>
        <% "duels" -> %>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase text-zinc-400">ACTIVE 1V1 & GHOST DUELS</span>
              <button phx-click="quick_duel" class="px-3 py-1 rounded-lg bg-[#32FF32] text-black text-[10px] font-black uppercase">
                + CHALLENGE RIVAL
              </button>
            </div>
            <%= for duel <- @arena.duels do %>
              <div class="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                <div class="flex items-center justify-between text-[10px] font-black uppercase text-[#32FF32]">
                  <span><%= duel.lift %></span>
                  <span><%= duel.wager_xp %> XP WAGER</span>
                </div>
                <div class="flex items-center justify-between text-xs font-bold">
                  <span><%= duel.challenger %> (<%= duel.your_score %>)</span>
                  <span class="text-zinc-500">VS</span>
                  <span><%= duel.opponent %> (<%= duel.opponent_score %>)</span>
                </div>
                <div class="text-[10px] text-zinc-400 font-semibold"><%= duel.status %></div>
              </div>
            <% end %>
          </div>

        <% "squads" -> %>
          <div class="space-y-3">
            <%= for sq <- @arena.squads do %>
              <div class="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-black uppercase text-white"><%= sq.name %></h3>
                    <p class="text-xs text-zinc-400"><%= sq.creed %></p>
                  </div>
                  <button
                    phx-click="toggle_squad"
                    phx-value-id={sq.id}
                    class={[
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                      if(sq.joined, do: "bg-zinc-800 text-[#32FF32] border border-[#32FF32]/40", else: "bg-[#32FF32] text-black")
                    ]}
                  >
                    <%= if sq.joined, do: "JOINED", else: "JOIN SQUAD" %>
                  </button>
                </div>

                <!-- Squad Daily Whiteboard WOD -->
                <div class="p-3 rounded-lg bg-black/70 border border-zinc-800 space-y-2">
                  <div class="text-[10px] font-black uppercase text-[#32FF32]">WHITEBOARD WOD • <%= sq.wod.title %></div>
                  <div class="text-xs text-zinc-300"><%= sq.wod.prescription %></div>
                  <div class="space-y-1 pt-1">
                    <%= for entry <- sq.wod.leaderboard do %>
                      <div class="flex justify-between text-[11px]">
                        <span class="font-bold text-zinc-200"><%= entry.athlete %></span>
                        <span class="font-mono text-[#32FF32]"><%= entry.score %></span>
                      </div>
                    <% end %>
                  </div>
                  <button
                    phx-click="log_wod_score"
                    phx-value-squad_id={sq.id}
                    class="w-full mt-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase text-white"
                  >
                    + POST VERIFIED WOD SCORE
                  </button>
                </div>
              </div>
            <% end %>
          </div>

        <% "gym_wars" -> %>
          <div class="space-y-2.5">
            <%= for gw <- @arena.gym_wars do %>
              <div class="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div class="text-xs font-black uppercase text-white">#<%= gw.rank %> <%= gw.gym %></div>
                  <div class="text-[11px] text-zinc-400"><%= gw.city %> • <%= gw.active_athletes %> Athletes</div>
                </div>
                <div class="text-xs font-black text-[#32FF32]"><%= gw.total_tonnage_kg %> KG</div>
              </div>
            <% end %>
          </div>

        <% "quests" -> %>
          <div class="space-y-2.5">
            <%= for q <- @arena.quests do %>
              <div class="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold text-white"><%= q.title %></div>
                  <div class="text-[10px] text-zinc-400">Progress: <%= q.progress %>/<%= q.target %></div>
                </div>
                <span class="px-2.5 py-1 rounded bg-[#32FF32]/15 text-[#32FF32] text-[10px] font-black">
                  +<%= q.reward_xp %> XP
                </span>
              </div>
            <% end %>
          </div>
      <% end %>
    </div>
    """
  end
end
