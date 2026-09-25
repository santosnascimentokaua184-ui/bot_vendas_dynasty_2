#!/bin/bash
echo "========================================"
echo "      Vendas Zend - Iniciando Bot"
echo "========================================"
echo

if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js nao encontrado. Instale em https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Instalando dependencias..."
    npm install
    echo
fi

echo "[INFO] Iniciando o bot..."
node index.js
