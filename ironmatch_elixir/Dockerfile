FROM hexpm/elixir:1.17.2-erlang-27.0-alpine

RUN apk add --no-cache build-base git curl

WORKDIR /app

RUN mix local.hex --force && \
    mix local.rebar --force

COPY mix.exs ./
RUN mix deps.get

COPY config ./config
COPY lib ./lib
COPY test ./test

EXPOSE 4000

CMD ["mix", "phx.server"]
