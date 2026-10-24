defmodule IronMatch.Arena.MatchmakerServer do
  @moduledoc """
  Stateful OTP `GenServer` powering the Competitive Arena, Ranked Duels,
  Ghost Duels, Tactical Squads, Global Whiteboard, and Live Gym Floor Roster.

  Broadcasts real-time state mutations over `Phoenix.PubSub` topic `"arena:global"`.
  """
  use GenServer

  @pubsub IronMatch.PubSub
  @topic "arena:global"

  # ============================================================================
  # Client API
  # ============================================================================

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def get_arena_state do
    GenServer.call(__MODULE__, :get_arena_state)
  end

  def toggle_spotter_beacon(user_id, exercise_name) do
    GenServer.call(__MODULE__, {:toggle_spotter_beacon, user_id, exercise_name})
  end

  def create_duel(challenger, opponent_name, lift, wager_xp) do
    GenServer.call(__MODULE__, {:create_duel, challenger, opponent_name, lift, wager_xp})
  end

  def create_squad(name, creed, min_total_kg, creator_name) do
    GenServer.call(__MODULE__, {:create_squad, name, creed, min_total_kg, creator_name})
  end

  def join_squad(squad_id, athlete_name) do
    GenServer.call(__MODULE__, {:join_squad, squad_id, athlete_name})
  end

  def post_whiteboard_wod(squad_id, wod_title, wod_prescription) do
    GenServer.call(__MODULE__, {:post_whiteboard_wod, squad_id, wod_title, wod_prescription})
  end

  def submit_whiteboard_score(squad_id, athlete_name, score_display) do
    GenServer.call(__MODULE__, {:submit_whiteboard_score, squad_id, athlete_name, score_display})
  end

  # ============================================================================
  # GenServer Callbacks
  # ============================================================================

  @impl true
  def init(_) do
    initial_state = %{
      gym_name: "Iron Paradise HQ • Amsterdam",
      gym_wars: [
        %{rank: 1, gym: "Iron Paradise HQ", city: "Amsterdam", total_tonnage_kg: 184_500, active_athletes: 42},
        %{rank: 2, gym: "Blacksmith Barbell", city: "Rotterdam", total_tonnage_kg: 171_200, active_athletes: 38},
        %{rank: 3, gym: "Valhalla Strength", city: "Utrecht", total_tonnage_kg: 149_800, active_athletes: 29}
      ],
      live_roster: [
        %{
          user_id: "usr_marcus",
          name: "Marcus Vance",
          tier: "Titan",
          sbd_total: 635,
          current_exercise: "Barbell Back Squat • 210kg × 3",
          spotter_needed: true,
          looking_for_partner: true
        },
        %{
          user_id: "usr_elena",
          name: "Elena Rostova",
          tier: "Vanguard",
          sbd_total: 425,
          current_exercise: "Conventional Deadlift • 165kg × 5",
          spotter_needed: false,
          looking_for_partner: true
        },
        %{
          user_id: "usr_priya",
          name: "Priya Nair",
          tier: "Contender",
          sbd_total: 290,
          current_exercise: "Neutral-Grip DB Bench • 24kg × 8",
          spotter_needed: false,
          looking_for_partner: false
        },
        %{
          user_id: "usr_jake",
          name: "Jake Miller",
          tier: "Varsity",
          sbd_total: 390,
          current_exercise: "Incline DB Press • 36kg × 8",
          spotter_needed: true,
          looking_for_partner: true
        }
      ],
      duels: [
        %{
          id: "duel_1",
          challenger: "You",
          opponent: "Jake Miller",
          lift: "Barbell Bench Press (Relative BWx)",
          your_score: "1.31x BW",
          opponent_score: "1.26x BW",
          wager_xp: 250,
          status: "LEADING • 14h left"
        },
        %{
          id: "duel_2",
          challenger: "Marcus Vance (Ghost)",
          opponent: "You",
          lift: "Weekly Tonnage Challenge",
          your_score: "14,200 kg",
          opponent_score: "15,800 kg",
          wager_xp: 500,
          status: "CHASING • 2d left"
        }
      ],
      squads: [
        %{
          id: "squad_apex",
          name: "APEX BARBELL CLUB",
          creed: "Heavy compounds, zero ego, strict depth.",
          min_total_kg: 450,
          members_count: 14,
          weekly_tonnage_kg: 86_400,
          joined: true,
          wod: %{
            title: "FRIDAY HEAVY TRIPLE & BACKOFF",
            prescription: "1x3 @ RPE 8.5 Back Squat + 3x6 @ 80% + 100 Walking Lunges",
            leaderboard: [
              %{athlete: "Marcus Vance", score: "210kg × 3 (11:40)"},
              %{athlete: "Elena Rostova", score: "145kg × 3 (12:05)"},
              %{athlete: "Jake Miller", score: "135kg × 3 (13:18)"}
            ]
          }
        },
        %{
          id: "squad_dawn",
          name: "06:00 DAWN PATROL",
          creed: "First rack open before sunrise. All levels welcome.",
          min_total_kg: 0,
          members_count: 23,
          weekly_tonnage_kg: 64_100,
          joined: false,
          wod: %{
            title: "UPPER VOLUME & DENSITY",
            prescription: "Bench Press 4x8 @ 75% + Weighted Chin-ups 4x6",
            leaderboard: [
              %{athlete: "Priya Nair", score: "62.5kg × 8"},
              %{athlete: "Chloe Vermeer", score: "32.5kg × 8"}
            ]
          }
        }
      ],
      quests: [
        %{id: "q1", title: "Log 3 Compound Sessions This Week", progress: 2, target: 3, reward_xp: 300, completed: false},
        %{id: "q2", title: "Spot or Fist-Bump a Local Gym Member", progress: 1, target: 1, reward_xp: 150, completed: true},
        %{id: "q3", title: "Hit a Verified RPE <= 8.5 Top Set", progress: 1, target: 1, reward_xp: 200, completed: true}
      ]
    }

    {:ok, initial_state}
  end

  @impl true
  def handle_call(:get_arena_state, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_call({:toggle_spotter_beacon, user_id, exercise_name}, _from, state) do
    updated_roster =
      case Enum.find_index(state.live_roster, &(&1.user_id == user_id)) do
        nil ->
          new_member = %{
            user_id: user_id,
            name: "You (Live Beacon)",
            tier: "Varsity",
            sbd_total: 405,
            current_exercise: exercise_name,
            spotter_needed: true,
            looking_for_partner: true
          }

          [new_member | state.live_roster]

        idx ->
          List.update_at(state.live_roster, idx, fn member ->
            %{member | spotter_needed: !member.spotter_needed, current_exercise: exercise_name}
          end)
      end

    new_state = %{state | live_roster: updated_roster}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:create_duel, challenger, opponent_name, lift, wager_xp}, _from, state) do
    new_duel = %{
      id: "duel_#{System.unique_integer([:positive])}",
      challenger: challenger,
      opponent: opponent_name,
      lift: lift,
      your_score: "Pending Set",
      opponent_score: "Accepted",
      wager_xp: wager_xp,
      status: "ACTIVE • 48h left"
    }

    new_state = %{state | duels: [new_duel | state.duels]}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:create_squad, name, creed, min_total_kg, creator_name}, _from, state) do
    new_squad = %{
      id: "squad_#{System.unique_integer([:positive])}",
      name: String.upcase(String.trim(name)),
      creed: creed,
      min_total_kg: min_total_kg,
      members_count: 1,
      weekly_tonnage_kg: 0,
      joined: true,
      wod: %{
        title: "INAUGURAL SQUAD BENCHMARK",
        prescription: "Work up to a clean 3RM Compound Lift of choice",
        leaderboard: [%{athlete: creator_name, score: "Founder Ready"}]
      }
    }

    new_state = %{state | squads: [new_squad | state.squads]}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:join_squad, squad_id, _athlete_name}, _from, state) do
    updated_squads =
      Enum.map(state.squads, fn sq ->
        if sq.id == squad_id do
          joined = !sq.joined
          delta = if joined, do: 1, else: -1
          %{sq | joined: joined, members_count: max(1, sq.members_count + delta)}
        else
          sq
        end
      end)

    new_state = %{state | squads: updated_squads}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:post_whiteboard_wod, squad_id, wod_title, wod_prescription}, _from, state) do
    updated_squads =
      Enum.map(state.squads, fn sq ->
        if sq.id == squad_id do
          %{sq | wod: %{sq.wod | title: String.upcase(wod_title), prescription: wod_prescription}}
        else
          sq
        end
      end)

    new_state = %{state | squads: updated_squads}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:submit_whiteboard_score, squad_id, athlete_name, score_display}, _from, state) do
    updated_squads =
      Enum.map(state.squads, fn sq ->
        if sq.id == squad_id do
          entry = %{athlete: athlete_name, score: score_display}
          %{sq | wod: %{sq.wod | leaderboard: [entry | sq.wod.leaderboard]}}
        else
          sq
        end
      end)

    new_state = %{state | squads: updated_squads}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  defp broadcast!(state) do
    Phoenix.PubSub.broadcast(@pubsub, @topic, {:arena_updated, state})
  end
end
