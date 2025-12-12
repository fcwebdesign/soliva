#!/bin/bash

# Script pour lancer Prisma Studio avec Node 20 via nvm
# Usage: ./scripts/prisma-studio.sh [port] [hostname]

# Résoudre le conflit entre nvm et Homebrew
unset npm_config_prefix

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Utiliser Node 20 (forcer l'activation)
nvm use 20.19.6 2>/dev/null || {
  echo "⚠️  nvm use a échoué, tentative avec le chemin direct..."
  export PATH="$NVM_DIR/versions/node/v20.19.6/bin:$PATH"
}

# Vérifier la version de Node
NODE_VERSION=$(node --version)
echo "🔍 Node version: $NODE_VERSION"

# Vérifier que c'est bien Node 20
if [[ ! "$NODE_VERSION" =~ ^v20\. ]]; then
  echo "⚠️  ATTENTION: Node 20 requis mais version détectée: $NODE_VERSION"
  echo "   Le script continuera mais Prisma Studio peut échouer"
  echo "   Pour corriger: nvm install 20.19.6 && nvm use 20.19.6"
  echo ""
fi

echo "🔍 Prisma version: $(npx prisma --version | head -n 1)"

# Charger les variables d'environnement depuis .env ou .env.local
ENV_LOADED=false
if [ -f .env.local ]; then
  echo "✅ Fichier .env.local trouvé, chargement des variables..."
  set -a
  source .env.local
  set +a
  ENV_LOADED=true
elif [ -f .env ]; then
  echo "✅ Fichier .env trouvé, chargement des variables..."
  set -a
  source .env
  set +a
  ENV_LOADED=true
else
  echo "⚠️  Aucun fichier .env ou .env.local trouvé"
  echo "   Vérification des variables d'environnement système..."
fi

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
  echo ""
  echo "❌ ERREUR: DATABASE_URL n'est pas définie"
  echo ""
  echo "Solutions possibles:"
  echo "1. Créer un fichier .env à la racine du projet avec:"
  echo "   DATABASE_URL=\"postgresql://user:password@host:port/database\""
  echo ""
  echo "2. Exporter la variable dans votre shell:"
  echo "   export DATABASE_URL=\"postgresql://user:password@host:port/database\""
  echo ""
  echo "3. Pour Supabase/Neon, copiez l'URL depuis votre dashboard"
  echo ""
  exit 1
fi

# Masquer partiellement l'URL pour la sécurité (afficher seulement le host)
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
echo "✅ DATABASE_URL trouvée (host: $DB_HOST)"

# Paramètres par défaut
PORT=${1:-5559}
HOSTNAME=${2:-127.0.0.1}

# Nettoyer le cache Prisma si nécessaire
echo "🧹 Nettoyage du cache Prisma..."
rm -rf node_modules/.prisma/client

# Régénérer le client Prisma avec Node 20
echo "🔄 Régénération du client Prisma..."
npx prisma generate

# Lancer Prisma Studio
echo ""
echo "🚀 Lancement de Prisma Studio sur http://${HOSTNAME}:${PORT}..."
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""
npx prisma studio --port "$PORT" --hostname "$HOSTNAME"

