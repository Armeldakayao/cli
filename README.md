# Swagger to TanStack Query Generator v2.0

A powerful CLI tool to automatically generate TypeScript types, Zod schemas, API functions, and TanStack Query hooks from Swagger/OpenAPI specifications.

## Features

- **TypeScript Types** - Auto-generated interfaces from Swagger schemas
- **Zod Schemas** - Validation schemas for forms (ShadCN compatible)
- **API Functions** - Type-safe Axios API calls
- **TanStack Query Hooks** - Ready-to-use `useQuery` and `useMutation` hooks
- **Query Keys** - Centralized query key management
- **Fake Data** - Optional test data generation
- **Tag Organization** - Files organized by Swagger tags
- **Smart Updates** - Preserve user modifications during regeneration
- **Auth Support** - Handle 401 with interactive credential prompt
- **Multi-language** - English and French comments
- **Watch Mode** - Auto-regenerate on file changes

## Installation

### Global Installation

```bash
npm install -g swagger-to-tanstack-cli
```

### Local Installation

```bash
npm install --save-dev swagger-to-tanstack-cli
```

### From Source

```bash
git clone <repository-url>
cd swagger-to-tanstack-cli
npm install
npm run build
npm link
```

## Quick Start

### 1. Initialize Your Project

```bash
swagger-to-tanstack init
```

This creates:
- `lib/axios.ts` - Axios configuration with interceptors
- `lib/query-keys.ts` - Query keys template

### 2. Generate from Swagger

```bash
swagger-to-tanstack generate -i https://api.example.com/swagger.json
```

### 3. Use in Your Components

```typescript
import { useUsers, useCreateUser } from '@/api/users/hooks';
import { createUserSchema } from '@/api/users/schemas';

function UsersList() {
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();

  const handleCreate = (formData: unknown) => {
    const validated = createUserSchema.parse(formData);
    createMutation.mutate(validated);
  };

  // ...
}
```

## Commands

### `init`

Initialize a new project with required files.

```bash
swagger-to-tanstack init
```

**Creates:**
- `lib/axios.ts` - Axios instance with auth interceptors
- `lib/query-keys.ts` - Centralized query keys

**When to use:**
- Starting a new project
- Setting up the base structure

---

### `generate`

Generate all files from a Swagger specification.

```bash
swagger-to-tanstack generate [options]
```

**Required Options:**
- `-i, --input <url|path>` - Swagger spec URL or local file path

**Optional Options:**
- `-o, --output <dir>` - Output directory (default: `./src/api`)
- `-b, --baseUrl <url>` - Override API base URL
- `-l, --language <lang>` - Comment language: `en` or `fr` (default: `en`)
- `--fake-data` - Generate fake data for testing
- `--preserve-modified` - Skip files with user modifications
- `-u, --username <user>` - Basic auth username
- `-p, --password <pass>` - Basic auth password

**Examples:**

```bash
# Basic generation
swagger-to-tanstack generate -i https://api.com/swagger.json

# With all options
swagger-to-tanstack generate \
  -i https://api.com/swagger.json \
  -o ./src/generated \
  --language fr \
  --fake-data \
  --preserve-modified

# With authentication
swagger-to-tanstack generate \
  -i https://api.com/swagger.json \
  -u admin \
  -p password

# From local file
swagger-to-tanstack generate -i ./swagger.json
```

**Generated Structure:**

```
src/api/
├── users/
│   ├── types.ts       # TypeScript interfaces
│   ├── schemas.ts     # Zod validation schemas
│   ├── api.ts         # API functions
│   ├── hooks.ts       # TanStack Query hooks
│   └── data.ts        # Fake data (if --fake-data)
├── products/
│   └── ...
lib/
├── axios.ts           # Axios configuration
└── query-keys.ts      # Query keys
```

**When to use:**
- Initial generation
- Complete regeneration
- After major Swagger changes

---

### `update`

Update generated files while preserving user modifications.

```bash
swagger-to-tanstack update [options]
```

**Required Options:**
- `-i, --input <url|path>` - Swagger spec URL or local file path

**Optional Options:**
- `-o, --output <dir>` - Output directory (default: `./src/api`)
- `-l, --language <lang>` - Comment language: `en` or `fr` (default: `en`)

**Examples:**

```bash
# Update from URL
swagger-to-tanstack update -i https://api.com/swagger.json

# Update with custom output
swagger-to-tanstack update -i ./swagger.json -o ./src/generated
```

**How it works:**

The `update` command automatically preserves files containing:
- `// CUSTOM` comments
- `// Modified` comments
- `// TODO` comments

**Example workflow:**

```typescript
// users/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { getUsers } from './api';

// CUSTOM: Added custom hook
export const useActiveUsers = () => {
  return useQuery({
    queryKey: ['users', 'active'],
    queryFn: () => getUsers().then(users => users.filter(u => u.active))
  });
};

// Auto-generated hook (will be updated)
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: getUsers,
  });
};
```

After running `update`, the custom hook is preserved while generated hooks are updated.

**When to use:**
- After Swagger API updates
- Adding new endpoints
- Preserving custom logic

---

### `watch`

Watch a local Swagger file and auto-regenerate on changes.

```bash
swagger-to-tanstack watch [options]
```

**Required Options:**
- `-i, --input <path>` - Local Swagger spec file path

**Optional Options:**
- `-o, --output <dir>` - Output directory (default: `./src/api`)
- `-l, --language <lang>` - Comment language: `en` or `fr` (default: `en`)

**Examples:**

```bash
# Watch local file
swagger-to-tanstack watch -i ./swagger.json

# Watch with custom output
swagger-to-tanstack watch -i ./api-spec.yaml -o ./src/generated
```

**Behavior:**
- Initial generation on start
- Automatically preserves modified files
- Regenerates on file save
- Press `Ctrl+C` to stop

**When to use:**
- Active API development
- Rapid prototyping
- Local Swagger editing

**Note:** Watch mode only works with local files, not URLs.

---

### `validate`

Validate a Swagger/OpenAPI specification.

```bash
swagger-to-tanstack validate [options]
```

**Required Options:**
- `-i, --input <url|path>` - Swagger spec URL or local file path

**Examples:**

```bash
# Validate from URL
swagger-to-tanstack validate -i https://api.com/swagger.json

# Validate local file
swagger-to-tanstack validate -i ./swagger.json
```

**Output:**

```
Validating Swagger specification...
✓ Valid OpenAPI specification
  Title: My API
  Version: 1.0.0
  Paths: 45
  Schemas: 23
  Tags: users, products, orders
```

**When to use:**
- Before generation
- Debugging Swagger issues
- Checking API documentation

---

## Generated Files Explained

### `types.ts`

TypeScript interfaces generated from Swagger schemas.

```typescript
// Auto-generated TypeScript types from Swagger/OpenAPI spec - users

/** User entity */
export interface User {
  /** User unique identifier */
  id: string;
  /** Username for login */
  username?: string;
  /** User email address */
  email: string;
  role: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}
```

---

### `schemas.ts`

Zod validation schemas for form validation.

```typescript
// Auto-generated Zod schemas from Swagger/OpenAPI spec - users
import * as z from "zod";

export const createUserDtoSchema = z.object({
  username: z.string().min(2, { message: "Too short" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Too short" }),
});

export type CreateUserDtoSchema = z.infer<typeof createUserDtoSchema>;
```

**Usage with forms:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserDtoSchema } from '@/api/users/schemas';

const form = useForm({
  resolver: zodResolver(createUserDtoSchema),
});
```

---

### `api.ts`

API functions with type-safe Axios calls.

```typescript
// Auto-generated API functions from Swagger/OpenAPI spec - users
import api from '@lib/axios';
import type {
  User,
  CreateUserDto
} from './types';

/**
 * Get all users
 */
export const getUsers = async (params?: { search?: string }) => {
  const { data } = await api.get<User[]>('/users', { params });
  return data;
};

/**
 * Create a new user
 */
export const createUser = async (payload: CreateUserDto) => {
  const { data } = await api.post<User>('/users', payload);
  return data;
};
```

**Key features:**
- Avoids variable name conflicts (`payload` instead of `data`)
- Path parameters properly templated
- Query parameters typed
- Response types from Swagger

---

### `hooks.ts`

TanStack Query hooks with query keys integration.

```typescript
// Auto-generated React Query hooks from Swagger/OpenAPI spec - users
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from '@lib/query-keys';
import type {
  User,
  CreateUserDto
} from './types';
import {
  getUsers,
  createUser
} from './api';

// Query Hooks

/**
 * Get all users
 */
export const useUsers = (params?: { search?: string }) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
  });
};

// Mutation Hooks

/**
 * Create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateUserDto) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};
```

**Smart invalidation:**
- `POST` → Invalidates lists only
- `PUT/PATCH` → Invalidates all (lists + details)
- `DELETE` → Invalidates all

---

### `data.ts` (Optional)

Fake data for testing and development.

```typescript
// Auto-generated fake data for testing - users
import type {
  User,
  CreateUserDto
} from './types';

export const fakeUser = {
  id: '1',
  username: 'Sample username',
  email: 'username@example.com',
  role: 'admin',
};

export const fakeUserList = [
  fakeUser,
  { ...fakeUser, id: '2' },
  { ...fakeUser, id: '3' },
];
```

**When to use:**
- Component development without backend
- Storybook stories
- Unit tests
- Demo data

---

### `lib/query-keys.ts`

Centralized query key management with type safety.

```typescript
// Central place to define all query keys
export const queryKeys = {
  // Users
  users: {
    all: ["users"],
    lists: () => [...queryKeys.users.all, "list"],
    list: (filters: any) => [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, "detail"],
    detail: (id: string) => [...queryKeys.users.details(), id],
  },
  // Products
  products: {
    all: ["products"],
    lists: () => [...queryKeys.products.all, "list"],
    list: (filters: any) => [...queryKeys.products.lists(), filters],
    details: () => [...queryKeys.products.all, "detail"],
    detail: (id: string) => [...queryKeys.products.details(), id],
  },
};
```

**Benefits:**
- Single source of truth
- Type-safe invalidation
- Hierarchical structure
- Easy to maintain

---

### `lib/axios.ts`

Axios instance with auth interceptors.

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-add token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Authentication

### Interactive 401 Handling

When the CLI encounters a 401 error, it prompts for credentials:

```bash
$ swagger-to-tanstack generate -i https://api.com/swagger.json

Fetching Swagger spec from https://api.com/swagger.json...

Authentication required (401)
Username: admin
Password: ********

Found Swagger spec...
```

### Passing Credentials

```bash
swagger-to-tanstack generate \
  -i https://api.com/swagger.json \
  -u admin \
  -p secretpassword
```

---

## Configuration

### Project Setup

**1. Install dependencies:**

```bash
npm install @tanstack/react-query zod axios
```

**2. Setup TanStack Query provider:**

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**3. Set environment variable:**

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## Advanced Usage

### Preserve Custom Logic

Mark your custom code to prevent overwriting:

```typescript
// hooks.ts

// CUSTOM: My custom hook
export const useFilteredUsers = (role: string) => {
  return useQuery({
    queryKey: ['users', 'filtered', role],
    queryFn: () => getUsers().then(users => 
      users.filter(u => u.role === role)
    ),
  });
};

// Auto-generated (will be updated on regeneration)
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: getUsers,
  });
};
```

### NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "generate:api": "swagger-to-tanstack generate -i https://api.com/swagger.json",
    "update:api": "swagger-to-tanstack update -i https://api.com/swagger.json",
    "watch:api": "swagger-to-tanstack watch -i ./swagger.json"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/generate-api.yml
name: Generate API

on:
  schedule:
    - cron: '0 0 * * *' # Daily
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g swagger-to-tanstack-cli
      - run: swagger-to-tanstack generate -i ${{ secrets.SWAGGER_URL }}
      - uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update API from Swagger'
          title: 'Update API from Swagger'
```

---

## Troubleshooting

### Common Issues

**1. HTML instead of JSON**

```
Error: Received HTML instead of Swagger spec
```

**Solution:** The CLI tries common endpoints automatically. If it fails, find the correct Swagger JSON URL in your API documentation.

**2. Invalid Swagger spec**

```
Error: Invalid Swagger/OpenAPI specification: missing paths
```

**Solution:** Validate your Swagger spec first:
```bash
swagger-to-tanstack validate -i <url>
```

**3. Files not generated**

**Solution:** Check that:
- Output directory is writable
- Swagger spec is valid
- You have proper permissions

**4. Module resolution errors**

```typescript
// Use these imports based on your tsconfig paths
import api from '@lib/axios';  // if using @lib alias
import api from '@/lib/axios'; // if using @ alias
import api from '../lib/axios'; // relative path
```

---

## FAQ

**Q: Can I customize generated code?**

A: Yes! Add `// CUSTOM`, `// Modified`, or `// TODO` comments. Use `--preserve-modified` flag or `update` command.

**Q: How do I handle API versioning?**

A: Generate into different directories:
```bash
swagger-to-tanstack generate -i /v1/swagger.json -o ./src/api/v1
swagger-to-tanstack generate -i /v2/swagger.json -o ./src/api/v2
```

**Q: Can I use with React Native?**

A: Yes! Remove localStorage code from `lib/axios.ts` and use AsyncStorage instead.

**Q: Does it support GraphQL?**

A: No, this tool is specifically for REST APIs with Swagger/OpenAPI specs.

**Q: How do I update after API changes?**

A: Use `update` command to preserve custom code:
```bash
swagger-to-tanstack update -i <url>
```

---

## Contributing

Contributions are welcome! Please open an issue or pull request.

---

## License

MIT

---

## Support

For issues and feature requests, please open an issue on GitHub.