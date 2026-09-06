#!/bin/bash

# Ollama starten
if ! pgrep -f "ollama serve" > /dev/null; then
    screen -dmS ollama bash -c "ollama serve"
    sleep 5
fi

# Bot starten
if ! screen -list | grep -q "\.bot"; then
    screen -dmS bot bash -c "cd /home/ubuntu/minecraft-bot && node index.js"
fi

echo "Ollama und Bot gestartet."