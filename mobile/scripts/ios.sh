#!/usr/bin/env bash
# Launch the app in the iOS Simulator without Expo's osascript-based Simulator
# focus (which needs Accessibility permission). Boots the sim, starts Metro in
# the foreground, and opens the app via a deep link once Metro is ready.
set -e

DEVICE="${1:-iPhone 16 Pro}"

# Boot the simulator (ignore "already booted") and bring the app forward.
xcrun simctl boot "$DEVICE" 2>/dev/null || true
open -a Simulator

# Once Metro is serving, open the project in Expo Go via a deep link.
(
  until curl -s -o /dev/null http://localhost:8081/status; do sleep 1; done
  xcrun simctl openurl booted "exp://127.0.0.1:8081"
) &

# Run Metro in the foreground so it stays alive.
exec npx expo start
