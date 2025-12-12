# 🔧 Troubleshooting Prisma Studio - Erreur "Invalid runtime"

## Problème

Prisma Studio affiche l'erreur "Invalid ...runtime..." malgré :
- Node 20 installé
- Client Prisma régénéré
- Données présentes dans la BDD

## Cause principale

Le problème vient souvent de l'utilisation de **Node 22** au lieu de **Node 20**. Prisma Studio peut avoir des problèmes de compatibilité avec Node 22.

## Solutions

### ✅ Solution 1 : Utiliser le script helper (Recommandé)

Un script a été créé pour garantir l'utilisation de Node 20 :

```bash
npm run studio
```

Ou directement :

```bash
./scripts/prisma-studio.sh
```

Ce script :
- Active automatiquement Node 20 via nvm
- Charge les variables d'environnement
- Régénère le client Prisma
- Lance Prisma Studio

### ✅ Solution 2 : Activer nvm manuellement

Dans votre terminal :

```bash
# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Utiliser Node 20
nvm use 20.19.6

# Vérifier la version
node --version  # Doit afficher v20.19.6

# Régénérer le client
npx prisma generate

# Lancer Prisma Studio
npx prisma studio --port 5559 --hostname 127.0.0.1
```

### ✅ Solution 3 : Configurer nvm automatiquement dans votre shell

Ajoutez dans votre `~/.zshrc` (ou `~/.bashrc`) :

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Auto-activer Node 20 dans ce projet
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

### ✅ Solution 4 : Vérifier les engines Prisma

Si le problème persiste, vérifiez que les engines Prisma sont bien installés :

```bash
# Nettoyer et réinstaller
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
npm install
npx prisma generate
```

### ✅ Solution 5 : Utiliser Prisma Studio en mode standalone

Si rien ne fonctionne, vous pouvez utiliser Prisma Studio en mode standalone :

```bash
# Installer Prisma Studio globalement
npm install -g prisma

# Lancer avec Node 20
nvm use 20.19.6
prisma studio --port 5559
```

## Vérifications

### Vérifier la version de Node active

```bash
node --version
```

**Doit afficher** : `v20.19.6` (ou une autre version 20.x)

**Ne doit PAS afficher** : `v22.x.x` ou `v24.x.x`

### Vérifier que Prisma Client fonctionne

```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.site.findMany().then(r => console.log('✅ Prisma Client OK:', r.length, 'sites')).catch(e => console.error('❌ Erreur:', e)).finally(() => prisma.$disconnect())"
```

### Vérifier la connexion à la BDD

```bash
npx prisma db pull --preview-feature
```

## Problèmes connus

### Node 22 incompatible

Prisma Studio peut avoir des problèmes avec Node 22. **Toujours utiliser Node 20** pour Prisma Studio.

### Variables d'environnement non chargées

Prisma ne charge plus automatiquement `.env`. Le script `prisma-studio.sh` gère cela automatiquement.

### Cache Prisma corrompu

Si le problème persiste :

```bash
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/engines
npx prisma generate
```

## Commandes utiles

```bash
# Voir toutes les versions Node installées
nvm list

# Utiliser Node 20
nvm use 20

# Régénérer Prisma Client
npx prisma generate

# Vérifier le schéma
npx prisma validate

# Voir les infos Prisma
npx prisma --version
```

## Support

Si le problème persiste après avoir essayé toutes ces solutions :

1. Vérifier les issues GitHub de Prisma : https://github.com/prisma/prisma/issues
2. Vérifier la documentation : https://www.prisma.io/docs
3. Vérifier les notes de version : https://github.com/prisma/prisma/releases

