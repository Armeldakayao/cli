# Swagger to TanStack CLI

Générateur CLI pour créer du code TypeScript à partir de spécifications Swagger/OpenAPI.

## Installation

```bash
npm install -g swagger-to-tanstack
```

## Structure du projet

```
swagger-to-tanstack/
├── src/
│   ├── index.ts                    # Point d'entrée CLI
│   ├── commands/                   # Commandes CLI
│   │   ├── init.ts
│   │   ├── generate.ts
│   │   ├── update.ts
│   │   ├── watch.ts
│   │   ├── validate.ts
│   │   ├── list-templates.ts
│   │   └── config.ts
│   ├── generators/
│   │   └── base.ts                 # Générateur principal
│   ├── utils/
│   │   ├── swagger-loader.ts       # Chargement Swagger
│   │   ├── string-utils.ts         # Utilitaires string
│   │   ├── type-generator.ts       # Génération types
│   │   ├── schema-generator.ts     # Génération schemas
│   │   └── file-utils.ts           # Utilitaires fichiers
│   ├── types/
│   │   ├── config.ts               # Types config
│   │   └── swagger.ts              # Types Swagger
│   └── templates/
│       ├── axios-config.ts         # Template Axios
│       ├── fetch-utils.ts          # Template Fetch
│       └── rtk-config.ts           # Template RTK Query
├── package.json
├── tsconfig.json
└── README.md
```

## Commandes disponibles

### 1. init
Initialise le projet avec les fichiers de configuration

```bash
swagger-to-tanstack init
```

Crée :
- `lib/axios.ts` : Configuration Axios
- `lib/query-keys.ts` : Clés de requêtes centralisées

### 2. generate
Génère le code depuis une spec Swagger

```bash
swagger-to-tanstack generate -i <path> [options]
```

**Options importantes :**
- `-i, --input <path>` : Fichier ou URL Swagger (requis)
- `-t, --template <name>` : Template (tanstack-query, rtk-query, swr, react-query-kit, basic)
- `-s, --structure <mode>` : Structure (split, group, group-hooks)
- `--http-client <client>` : Client HTTP (axios, fetch)
- `--validator <validator>` : Validateur (zod, yup)
- `--strip-base-path [path]` : Retirer base path
- `--include-tags <tags>` : Tags à inclure
- `--exclude-tags <tags>` : Tags à exclure

### 3. update
Met à jour le code en préservant les modifications utilisateur

```bash
swagger-to-tanstack update -i <path>
```

### 4. watch
Surveille les changements du fichier Swagger

```bash
swagger-to-tanstack watch -i ./swagger.json
```

### 5. validate
Valide une spécification Swagger

```bash
swagger-to-tanstack validate -i <path>
```

### 6. list-templates
Liste tous les templates disponibles

```bash
swagger-to-tanstack list-templates
```

### 7. config
Génère le fichier config pour RTK Query

```bash
swagger-to-tanstack config
```

## Exemples d'utilisation

### TanStack Query + Axios + Zod
```bash
swagger-to-tanstack generate \
  -i ./swagger.json \
  -t tanstack-query \
  -s group-hooks \
  --http-client axios \
  --validator zod
```

### RTK Query (génère automatiquement le config)
```bash
swagger-to-tanstack generate \
  -i ./swagger.json \
  -t rtk-query
```

### SWR avec filtrage de tags
```bash
swagger-to-tanstack generate \
  -i ./swagger.json \
  -t swr \
  --include-tags users,posts \
  --exclude-tags admin
```

### Retirer le base path des URLs
```bash
swagger-to-tanstack generate \
  -i ./swagger.json \
  --strip-base-path /api/v1
```

## Templates supportés

### 1. TanStack Query
- Compatible : split, group, group-hooks
- Utilise useQuery et useMutation

### 2. RTK Query
- Compatible : group-hooks uniquement
- Génère automatiquement `src/services/config.ts`

### 3. SWR
- Compatible : group-hooks uniquement
- Utilise useSWR

### 4. React Query Kit
- Compatible : group-hooks uniquement
- Utilise createQuery et createMutation

### 5. Basic
- Compatible : group-hooks uniquement
- Utilise useState et useEffect

## Structures de fichiers

### group-hooks (recommandé)
```
users/
├── api.ts          # Fonctions API
├── hooks.ts        # Queries + Mutations
├── types.ts        # Types TypeScript
└── schemas.ts      # Schémas Zod/Yup
```

### group
```
users/
├── api.ts
├── queries.ts
├── mutations.ts
├── types.ts
└── schemas.ts
```

### split
```
users/
├── api/
│   ├── getUsers.ts
│   └── createUser.ts
├── queries/
│   └── useGetUsers.ts
├── mutations/
│   └── useCreateUser.ts
├── types.ts
└── schemas.ts
```

## Fonctionnalités

### Filtrage par tags
Générez seulement certains endpoints :

```bash
# Inclure seulement users et roles
swagger-to-tanstack generate -i ./swagger.json --include-tags users,roles

# Exclure admin et internal
swagger-to-tanstack generate -i ./swagger.json --exclude-tags admin,internal
```

### Base path stripping
Retirez automatiquement le base path des URLs :

```bash
# Retire /api/v1 de toutes les routes
swagger-to-tanstack generate -i ./swagger.json --strip-base-path /api/v1

# Résultat : /users au lieu de /api/v1/users
```

### Upload de fichiers
Détection automatique de `multipart/form-data` :

```yaml
# Dans votre Swagger
/files/upload:
  post:
    requestBody:
      content:
        multipart/form-data:
          schema:
            properties:
              file:
                type: string
                format: binary
```

Génère automatiquement :
```typescript
export const uploadFile = async (payload: { file: File }) => {
  const { data } = await api.post('/files/upload', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};
```

### Préservation des modifications
Les fichiers avec ces marqueurs ne sont pas écrasés :

```typescript
// CUSTOM
// Modified
// TODO
// KEEP
```

## Build et développement

```bash
# Installer les dépendances
npm install

# Compiler
npm run build

# Développement
npm run dev

# Watch mode
npm run watch
```

## Publier

```bash
npm publish
```

## Licence

MIT