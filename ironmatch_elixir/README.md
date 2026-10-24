# IronMatch Elixir (Phoenix LiveView + OTP Edition)

A complete **100% Elixir, Phoenix LiveView, and Erlang/OTP** implementation of **IronMatch** — the tactical strength training, tendon-safe programming, and real-time gym floor network.

---

## Architecture Highlights (Why Elixir + OTP)

1. **OTP Supervision & Fault-Tolerant Active Workouts (`IronMatch.Workouts.SessionSupervisor` & `ActiveSessionServer`)**:
   - Every active solo or group workout runs inside its own isolated OTP `GenServer` registered via `Registry.lookup(IronMatch.SessionRegistry, session_id)`.
   - If an athlete walks into a basement gym dead-zone and their WebSocket reconnects 5 minutes later, their exact set state, RPE autoregulation banner, and server-side rest timer are still running in BEAM memory.
2. **Real-Time Competitive Arena & Squad Whiteboard (`IronMatch.Arena.MatchmakerServer`)**:
   - In-memory OTP `GenServer` + `Phoenix.PubSub` broadcasting Ranked 1v1 Duels, Ghost Duels, Squad memberships, Global Daily Whiteboard WOD scores, and Live Spotter Beacons across all connected devices in sub-millisecond latency.
3. **Distributed CRDT Gym Floor Radar (`IronMatchWeb.Presence` & `GymRadarChannel`)**:
   - Tracks which athletes are actively lifting on the gym floor, their current exercise, and live Spotter Needed beacons without database polling.
4. **Pure Functional Domain Engines**:
   - [`lib/iron_match/gamification.ex`](./lib/iron_match/gamification.ex): Unified 6-Tier SBD Ranking (`Freshman`, `Contender`, `Varsity`, `Vanguard`, `Titan`, `Immortal`), Epley 1RM estimator, and DOTS relative strength calculator.
   - [`lib/iron_match/workouts/blueprint_generator.ex`](./lib/iron_match/workouts/blueprint_generator.ex): 8-Week 4-Day Tendon & Strength Split with beginner-safe dumbbell/goblet-squat scaling (`5kg`/`10lbs` floor) and `kg`/`lbs` rounding.
   - [`lib/iron_match/workouts/autoregulation.ex`](./lib/iron_match/workouts/autoregulation.ex): Real-time RPE/RIR autoregulation load adjustments.
   - [`lib/iron_match/workouts/plates.ex`](./lib/iron_match/workouts/plates.ex): Greedy Olympic barbell plate loader (`kg` & `lbs`).
   - [`lib/iron_match/physio/combat_physio.ex`](./lib/iron_match/physio/combat_physio.ex): In-workout joint/tendon pain triage & biomechanical exercise swapper.
   - [`lib/iron_match/billing/revenue_cat.ex`](./lib/iron_match/billing/revenue_cat.ex): Native App Store / Google Play RevenueCat webhook & trial verification.

---

## Quick Start

### Option A: Run with Docker (Zero Local Elixir Install Required)
```bash
cd ironmatch_elixir
docker build -t ironmatch-elixir .
docker run --rm -p 4000:4000 ironmatch-elixir
```
Then open `http://localhost:4000` in your browser or mobile simulator.

### Option B: Run Natively with Elixir & Mix
```bash
cd ironmatch_elixir
mix deps.get
mix test
mix phx.server
```
