#!/bin/bash

echo "🚀 Iniciando MM System em modo produção..."

# Diretório do projeto
PROJECT_DIR="/home/ubuntu/mm_system"
cd "$PROJECT_DIR"

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "📦 Iniciando PostgreSQL..."

    if command -v pg_ctlcluster >/dev/null 2>&1; then
        sudo pg_ctlcluster 17 main start >/dev/null 2>&1 || true
    elif command -v service >/dev/null 2>&1; then
        sudo service postgresql start >/dev/null 2>&1 || true
    fi

    sleep 2
fi

# Iniciar backend em background
echo "🔧 Iniciando backend (porta 4000)..."
cd "$PROJECT_DIR/backend"
NODE_ENV=production npm start > /home/ubuntu/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Aguardar backend iniciar
sleep 3

# Servir frontend com servidor estático
echo "🌐 Iniciando frontend (porta 3000)..."
cd "$PROJECT_DIR/frontend"
npx serve -s dist -l 3000 > /home/ubuntu/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Aguardar serviços iniciarem
sleep 2

echo ""
echo "✅ Serviços iniciados com sucesso!"
echo ""
echo "📊 Backend:  http://localhost:4000/api/v1/health"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /home/ubuntu/backend.log"
echo "   Frontend: tail -f /home/ubuntu/frontend.log"
echo ""
echo "🛑 Para parar os serviços: kill $BACKEND_PID $FRONTEND_PID"
