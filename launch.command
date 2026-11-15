#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")"
(sleep 1.5 && open "http://localhost:4173") &
npm run preview -- --port 4173
