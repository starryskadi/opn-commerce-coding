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

## Features

### Product Management
- Product colllection with unique IDs, names, and prices
- Add individual or bulk products to the catalog
- Retrieve products by ID
- Remove products from the colllection

### Shopping Cart
- Add products to cart with specified quantities
- Update product quantities in the cart
- Remove products from the cart
- View cart contents with product details
- Singleton cart pattern ensuring consistent cart state throughout the application
- Event service for tracking cart changes
- Automatic updates when cart contents change
- Automatic freebie application and removal based on cart contents


### Discounts
- Two discount types: Fixed and Percentage
  - Fixed: Apply a specific amount discount
  - Percentage: Apply a percentage-based discount with optional maximum cap
- Apply discounts to the cart total
- Remove applied discounts
- Support for discount management (add, retrieve, remove)
- Support multiple discounts to apply (used stacked order discount method)

### Freebies (Buy X Get Y)
- Configure "Buy X Get Y" promotions where purchasing one product grants free units of another
- Define quantities for both the qualifying product (X) and the free product (Y)
- Automatic application of free products when qualifying products are added to cart
- Automatic removal of freebies when qualifying products are removed
- Freebies are marked as free and don't contribute to subtotal calculations
- Freebies can be given based on every quantity of the buyX or only once.

## Author

Kyaw Zayar Win

## To Do  

- [x] BUG: Freebies need to be actual free in the amount
- [x] BUG: Freebies need to be able to remove
- [x] BUG: Sub Total Amount shouldn't includes Freebies Amount.
- [x] BUG: Remove Discount by Name.
- [x] TODO: Support Multiple Discounts.
- [x] Enhancement: BuyX determine with quantity and getY with quantity, example, BuyX 5, GetY 2
- [x] Enhancement: TODO: Seperate back add and update to align with coding testing
- [ ] Enhancement: Add id checking or do lastIndexes things when creating items to reduce the id conflict
- [x] Enhancement: Add private or public typescript
- [x] Refactor: Align more with OOP concept
- [ ] Enhancement: Support Independent Discounts