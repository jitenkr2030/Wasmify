# WebAssembly Platform

A comprehensive WebAssembly platform inspired by Wasmer.io, providing runtime management, package registry, and global edge deployment capabilities.

## 🚀 Features

### Core Platform Components

- **WebAssembly Runtime Management** - Real-time monitoring and configuration of Wasmtime engine
- **Package Manager (WAPM-like)** - Browse, publish, and manage WebAssembly packages
- **Serverless Edge Cloud** - Deploy modules to global edge network with millisecond latency
- **Comprehensive Monitoring** - Real-time metrics, alerts, and deployment tracking

### Key Features

- 🌍 **Global Edge Network** - Deploy to 50+ edge locations worldwide
- ⚡ **Millisecond Cold Starts** - Optimized WebAssembly runtime performance
- 📦 **Package Registry** - NPM-style package manager for Wasm modules
- 📊 **Real-time Analytics** - Comprehensive monitoring and alerting
- 🔒 **Secure Sandbox** - Isolated execution environment
- 🎯 **Multi-language Support** - Rust, Go, C/C++, AssemblyScript, and more

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** with App Router
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Lucide React** icons

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** with SQLite database
- **Zod** for schema validation
- **z-ai-web-dev-sdk** for AI capabilities

### Infrastructure
- **SQLite** for development database
- **Prisma** for database management
- **Next.js** for both frontend and backend

## 📋 Prerequisites

- Node.js 18+ or Bun runtime
- npm, yarn, or bun package manager

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd webassembly-platform

# Install dependencies
bun install

# Set up the database
bun run db:push

# Seed sample data
bun run seed-data.ts

# Start development server
bun run dev
```

### Development

```bash
# Start development server
bun run dev

# Run linting
bun run lint

# Database operations
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── modules/       # Module management
│   │   ├── deployments/   # Deployment operations
│   │   └── stats/          # Platform statistics
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/ui/          # shadcn/ui components
├── hooks/                  # React hooks
├── lib/                    # Utilities and database
└── styles/                 # Additional styles
```

## 🌐 API Endpoints

### Modules API
- `GET /api/modules` - List all WebAssembly modules
- `POST /api/modules` - Create new module

### Deployments API
- `GET /api/deployments` - List all deployments
- `POST /api/deployments` - Create new deployment

### Statistics API
- `GET /api/stats` - Platform statistics and metrics

## 🗄️ Database Schema

### Core Models

- **User** - Platform users and authentication
- **WasmModule** - WebAssembly modules and metadata
- **Deployment** - Module deployments and configurations
- **Package** - Package registry information
- **EdgeNode** - Global edge node management
- **DeploymentMetric** - Performance and usage metrics
- **ApiKey** - Authentication and authorization

### Relationships

```
User ──┬── WasmModule ──── Deployment ──── DeploymentMetric
       │                   │
       ├── Package          │
       │                   │
       └── ApiKey           └── EdgeNode
```

## 🎨 UI Components

### Main Dashboard Tabs

1. **Overview** - Platform statistics and quick actions
2. **Runtime** - WebAssembly runtime management
3. **Packages** - Package registry and management
4. **Edge Cloud** - Global edge network management
5. **Monitoring** - Analytics and alerting

### Key Features

- Real-time data fetching from APIs
- Responsive design for all screen sizes
- Interactive charts and metrics
- Alert system with critical/warning levels
- Deployment history and status tracking

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Runtime Configuration

The platform supports various WebAssembly runtime settings:

- **Memory Limits**: Default 64MB, Max 4GB
- **Execution Time**: Maximum 30 seconds
- **Security**: Secure sandbox mode enabled
- **WASI Support**: WebAssembly System Interface

## 📦 Package Management

### Supported Languages

| Language | Status | Notes |
|-----------|--------|-------|
| Rust | Excellent | Full support, best performance |
| Go | Good | Good support, some limitations |
| C/C++ | Excellent | Full support |
| AssemblyScript | Good | TypeScript-like experience |
| Zig | Experimental | Emerging support |
| D | Good | Good support |
| C# | Experimental | Limited support |
| Java | Limited | Basic functionality |

### Package Publishing

```bash
# Example: Publishing a Rust package
wasm-pack build --target web
my-wapm publish
```

## 🌍 Edge Deployment

### Global Regions

- **US East**: Virginia, USA
- **US West**: California, USA  
- **Europe West**: Ireland
- **Europe Central**: Frankfurt, Germany
- **Asia Pacific**: Singapore
- **Asia Northeast**: Tokyo, Japan

### Deployment Features

- **Auto-scaling**: Automatic scaling based on load
- **Geo-routing**: Route to nearest edge node
- **Cache Headers**: Configurable caching behavior
- **Health Monitoring**: Real-time node health status

## 📊 Monitoring

### Metrics Tracked

- **Request Volume**: Requests per minute/hour/day
- **Response Times**: P50, P95, P99 latencies
- **Error Rates**: Error percentages by type
- **Resource Usage**: Memory and CPU consumption
- **Edge Performance**: Cache hit rates, transfer speeds

### Alert Types

- **Critical**: High error rates, service failures
- **Warning**: Performance degradation, capacity limits
- **Info**: Deployments, configuration changes

## 🔒 Security

### Runtime Security

- **Sandbox Isolation**: Each module runs in isolated sandbox
- **Memory Limits**: Configurable memory constraints
- **Execution Limits**: Time and instruction limits
- **Resource Controls**: CPU and resource throttling

### Authentication

- **API Keys**: Scoped API key authentication
- **Role-based Access**: Different permission levels
- **Secure Headers**: Security headers enforcement

## 🚀 Production Deployment

### Building for Production

```bash
# Build optimized production bundle
bun run build

# Start production server
bun run start
```

### Infrastructure Requirements

- **Node.js Runtime**: Node.js 18+ or Bun
- **Database**: SQLite (development), PostgreSQL (production)
- **File Storage**: AWS S3 or similar for module files
- **CDN**: CloudFront or similar for edge distribution

### Environment Setup

1. **Database Migration**
   ```bash
   bun run db:migrate
   ```

2. **Seed Production Data**
   ```bash
   bun run seed-data.ts
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with production values
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Wasmer.io** - Inspiration for platform architecture
- **Bytecode Alliance** - WebAssembly standards and tools
- **Wasmtime** - High-performance WebAssembly runtime
- **shadcn/ui** - Beautiful component library
- **Next.js** - React framework for production

## 📞 Support

For support and questions:

- 📧 Email: support@wasmplatform.com
- 💬 Discord: [Community Discord]
- 📖 Documentation: [Platform Docs]
- 🐛 Issues: [GitHub Issues]

---

**Built with ❤️ using Next.js, TypeScript, and WebAssembly**