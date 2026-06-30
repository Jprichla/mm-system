#!/bin/bash

echo "🛑 Parando MM System..."

# Parar backend (porta 4000)
BACKEND_PID=$(lsof -ti:4000)
if [ ! -z "$BACKEND_PID" ]; then
    echo "Parando backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    sleep 2
fi

# Parar frontend (porta 3000)
FRONTEND_PID=$(lsof -ti:3000)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "Parando frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
    sleep 2
fi

echo "✅ Serviços parados!"
