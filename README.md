# Inventory System

A simple inventory management API built with NestJS, TypeScript, and MySQL (via TypeORM).

## 📝 Table of Contents

* [Features](#features)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Running the App](#running-the-app)
* [API Documentation (Swagger)](#api-documentation-swagger)
* [HTTP Client Examples](#http-client-examples)
* [API Endpoints](#api-endpoints)
* [Folder Structure](#folder-structure)
* [Testing](#testing)
* [License](#license)

## Features

* CRUD operations for **Products** and **Inventory Items**
* Validation with `class-validator` and `class-transformer`
* Database integration using TypeORM and MySQL
* API versioning under `/api/v1`
* Interactive API docs with Swagger (/api/v1/docs)
* Global validation pipe and error handling

## Prerequisites

* Node.js >= 18.x
* npm >= 9.x
* MySQL server

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/edwinrhc/inventory-system.git
   cd inventory-system
   ```
2. **Install dependencies**:

   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory and set the following:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=inventory_db
```

## Running the App

Start the development server with:

```bash
npm run start:dev
```

The server will run on `http://localhost:3000` by default.

## API Documentation (Swagger)

Once the server is running, you can access the Swagger UI here:

```
http://localhost:3000/api/v1/docs
```

Use this interface to explore and test all available endpoints.

## HTTP Client Examples

A sample WebStorm HTTP client file (`api-client.http`) is provided in the project root. You can use it to run requests directly from your IDE.

Example snippet:

```http
### Create a new product
POST http://localhost:3000/api/v1/products
Content-Type: application/json

{
  "sku": "PROD-010",
  "name": "Llave Inglesa 12\"",
  "description": "Llave ajustable de 12 pulgadas con mango antideslizante.",
  "price": 15.75
}

### Create an inventory item
POST http://localhost:3000/api/v1/inventory
Content-Type: application/json

{
  "productId": "051f1fcf-3657-4275-ba2a-723447adc27a",
  "quantity": 100,
  "status": "available"
}
```

## API Endpoints

### Products

| Method | Path                   | Description              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/v1/products`     | Create a new product     |
| GET    | `/api/v1/products`     | Retrieve all products    |
| GET    | `/api/v1/products/:id` | Retrieve a product by ID |
| PATCH  | `/api/v1/products/:id` | Update a product by ID   |
| DELETE | `/api/v1/products/:id` | Delete a product by ID   |

### Inventory

| Method | Path                    | Description                      |
| ------ | ----------------------- | -------------------------------- |
| POST   | `/api/v1/inventory`     | Create a new inventory item      |
| GET    | `/api/v1/inventory`     | Retrieve all inventory items     |
| GET    | `/api/v1/inventory/:id` | Retrieve an inventory item by ID |
| PATCH  | `/api/v1/inventory/:id` | Update an inventory item by ID   |
| DELETE | `/api/v1/inventory/:id` | Delete an inventory item by ID   |

## Folder Structure

```
src/
├── common/               # Shared pipes, filters, DTOs
├── config/               # TypeORM and environment config
├── products/             # Products module
├── inventory/            # Inventory module
├── app.module.ts         # Root module
└── main.ts               # Application entry point
```

## Testing

*No tests implemented yet.*

## License

MIT © Edwin RHC
