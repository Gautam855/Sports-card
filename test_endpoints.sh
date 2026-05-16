#!/bin/bash
HOST="allsportsapi2.p.rapidapi.com"
KEY="c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623"
DATE="2026-05-15"

ENDPOINTS=(
  "/api/matches/schedule/$DATE"
  "/api/matches/fixtures/$DATE"
  "/api/events/schedule/$DATE"
  "/api/events/fixtures/$DATE"
  "/api/sport/2/matches/date/$DATE"
  "/api/sport/2/events/date/$DATE"
  "/api/sport/2/events/schedule/$DATE"
  "/api/categories"
  "/api/sports"
)

for endpoint in "${ENDPOINTS[@]}"; do
  curl -s --request GET \
    --url "https://$HOST$endpoint" \
    --header 'Content-Type: application/json' \
    --header "X-Rapidapi-Host: $HOST" \
    --header "X-Rapidapi-Key: $KEY" | jq ".\"$endpoint\" = (.message // \"EXISTS\")" | grep -v 'null' | head -n 1
done
