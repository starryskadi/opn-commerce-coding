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

## To Do  

- [ ] BUG: Freebies need to be actual free in the amount
- [ ] BUG: Freebies need to be able to remove
- [ ] BUG: Sub Total Amount shouldn't includes Freebies Amount.
- [ ] BUG: Remove Discount by Name.
- [ ] TODO: Support Multiple Discounts.
- [ ] Enhancement: Get total price of each unique items in the cart to let user saw that how many freebies they get.
- [ ] Enhancement: BuyX determine with quantity and getY with quantity, example, BuyX 5, GetY 2
- [ ] Enhancement: TODO: Seperate back add and update to align with coding testing
- [ ] Enhancement: Add id checking or do lastIndexes things when creating items to reduce the conflict
- [ ] Enhancement: Add private or public typescript
- [ ] Refactor: Align more with OOP concept