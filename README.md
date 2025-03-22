## Prerequisites

- Node.js 
- pnpm package manager - Optional

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd commerce-cli
```

2. Install dependencies:
```bash
pnpm install
```

or 

```bash
npm install
```

## Project Structure

```
├── src/
│   ├── app.ts              # Main application entry point
│   ├── cart.service.ts     # Cart management
│   ├── discount.service.ts # Discounts
│   ├── freebies.service.ts # Freebies
│   ├── product.service.ts  # Products
│   ├── status.ts           # Status
│   └── utils.ts            # Utility functions
├── tests/                  # Test files
├── dist/                  
└── package.json           
```

## Available Scripts

- `pnpm start`: Compile TypeScript and run the application
- `pnpm dev`: Run the application in development mode with hot-reload
- `pnpm test`: Run Jest tests
- `pnpm tsc`: Compile TypeScript files
- `pnpm watch`: Watch for TypeScript file changes

## Testing

Tests are written using Jest. Run the test suite with:

```bash
pnpm test
```

## Author

Kyaw Zayar Win
