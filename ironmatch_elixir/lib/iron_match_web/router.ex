defmodule IronMatchWeb.Router do
  @moduledoc """
  Phoenix Router mapping all IronMatch mobile LiveView screens and native
  RevenueCat IAP webhook endpoints.
  """
  use IronMatchWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {IronMatchWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", IronMatchWeb do
    pipe_through :browser

    live "/", SocialHubLive, :index
    live "/workouts", WorkoutsLive, :index
    live "/arena", ArenaLive, :index
    live "/messages", MessagesLive, :index
    live "/profile", ProfileLive, :index
    live "/onboarding", OnboardingLive, :index
  end

  scope "/api/webhooks", IronMatchWeb do
    pipe_through :api

    post "/revenuecat", RevenueCatWebhookController, :create
  end
end
