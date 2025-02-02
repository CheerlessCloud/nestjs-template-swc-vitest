# NestJS modern template with SWC, Vitest, Zod and MikroORM

[![NestJS](https://img.shields.io/badge/NestJS-11.0.0-E0234E?logo=nestjs)](https://nestjs.com)
[![ExpressJS](https://img.shields.io/badge/ExpressJS-4.x-000000?logo=express)](https://expressjs.com)
[![SWC](https://img.shields.io/badge/SWC-1.x-F5C400?logo=swc)](https://swc.rs)
[![Vitest](https://img.shields.io/badge/Vitest-1.6.2-6E9F18?logo=vitest)](https://vitest.dev)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-F69220?logo=pnpm)](https://pnpm.io)

**A speed-optimized NestJS template** with modern build stack.

Is up-to-date for beginning of 2025 and well tested with all dependencies and use-cases. To be honest, I had no time for maintain all dependencies updates, so PRs for update dependencies are welcome 😌

## Tech Stack

- 🚀 **Node.js v22** with **native ES modules**
- 🛠️ **NestJS v11** as the primary framework
- 📦 **pnpm** for fast, disk-space efficient package management
- ⚡ **SWC** - 20x faster than `tsc`
- 🔍 **TypeScript v5.7** with strict mode
- 📝 **ESLint & Prettier** for code quality
- 🐶 **Husky** and **lint-staged** for linting on commit
- 🧪 **Vitest** for lightning-fast testing, with integration & unit projects setup
- 📝 **dotenv-flow** for environment variables
- 🗄️ **MikroORM** with **MongoDB** driver and **@mikro-orm/nestjs** adapter
- ✅ **Zod** for validation and **@anatine/zod-nestjs** for OpenAPI and Swagger support
- 📚 **Swagger** for API documentation
- 📝 **Winston** with custom configuration for advanced logging
- 🐳 **Docker** multi-stage alpine image
- 🪄 **.cursorrules** for Cursor IDE

## Installation

```bash
# Clone the repository
git clone https://github.com/CheerlessCloud/nestjs-template-swc-vitest.git $YOUR_PROJECT_NAME$
cd $YOUR_PROJECT_NAME$

# Cleanup git history
rm -rf .git pnpm-lock.yaml
git init

# Init npm package
npm init
# fill all fields and confirm...

# Install dependencies
pnpm install

# Set up environment variables (tune for your needs)
cp .env.example .env
# Set up test environment variables (tune for your needs)
cp .env.example .env.test

# Up MongoDB container from docker-compose.yml
docker compose up -d
# or docker-compose up -d for legacy docker-compose executable

# Start development server with watch mode
pnpm start:dev
```

### Development Scripts

```bash
# Run tests
pnpm test                # Run all tests
pnpm test:unit           # Run unit tests
pnpm test:integration    # Run integration tests
pnpm test:watch          # Run tests in watch mode

# Build
pnpm build               # Production build

# Linting
pnpm lint               # Check code style
pnpm lint:fix           # Fix code style
pnpm lint:format        # Format code

# Type checking
pnpm types:check        # Check TypeScript types
```
