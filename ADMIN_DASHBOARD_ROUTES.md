# Admin Dashboard API Routes

This document provides a comprehensive overview of all available admin dashboard routes for managing the pharmacies commerce platform.

## Authentication & Authorization

All admin routes require:

- JWT authentication
- Admin or Super-admin role
- Routes are protected with `@UseGuards(RolesGuard)` and `@Roles('admin', 'super-admin')`

## Base URL: `/admin`

## 1. Dashboard & Analytics

### Dashboard Statistics

- **GET** `/admin/dashboard/stats`
  - Returns overview statistics (total users, medicines, orders, pharmacies, reviews)

### Analytics

- **GET** `/admin/dashboard/analytics`
  - Returns order analytics and revenue data

### Advanced Reports

- **GET** `/admin/reports/users`

  - Users report with role distribution and recent users

- **GET** `/admin/reports/revenue?period=month`

  - Revenue report (supports: week, month, year)

- **GET** `/admin/reports/medicines`

  - Medicines report with category breakdown

- **GET** `/admin/reports/pharmacies`
  - Pharmacies report with status breakdown

## 2. User Management

### List Users

- **GET** `/admin/users?page=1&limit=10&search=name`
  - Paginated list of all users with search functionality

### User Operations

- **PATCH** `/admin/users/:id/role`

  - Update user role
  - Body: `{ "role": "admin|user|super-admin" }`

- **DELETE** `/admin/users/:id`

  - Delete a user

- **GET** `/admin/users/:id`
  - Get detailed user information including orders and reviews

### Bulk User Operations

- **POST** `/admin/bulk/users/activate`
  - Bulk activate users
  - Body: `{ "userIds": ["id1", "id2"] }`

## 3. Medicine Management

### List Medicines

- **GET** `/admin/medicines?page=1&limit=10&search=name&category=care`
  - Paginated list with search and category filtering

### Medicine Operations

- **POST** `/admin/medicines`

  - Create new medicine
  - Body: CreateMedicineAdminDto

- **PATCH** `/admin/medicines/:id`

  - Update medicine details
  - Body: UpdateMedicineAdminDto

- **DELETE** `/admin/medicines/:id`

  - Delete medicine

- **PATCH** `/admin/medicines/:id/image`
  - Upload medicine image (multipart/form-data)

### Bulk Medicine Operations

- **POST** `/admin/bulk/medicines/update-category`
  - Bulk update medicine categories
  - Body: `{ "medicineIds": ["id1"], "category": "care" }`

## 4. Order Management

### List Orders

- **GET** `/admin/orders?page=1&limit=10&status=pending&paymentStatus=unpaid`
  - Paginated orders with status filtering

### Order Operations

- **PATCH** `/admin/orders/:id/status`

  - Update order status
  - Body: `{ "status": "pending|confirmed|processing|shipped|delivered|cancelled" }`

- **PATCH** `/admin/orders/:id/payment-status`

  - Update payment status
  - Body: `{ "paymentStatus": "unpaid|paid|failed|refunded" }`

- **GET** `/admin/orders/:id/details`
  - Get detailed order information

## 5. Pharmacy Management

### List Pharmacies

- **GET** `/admin/pharmacies?page=1&limit=10&search=name&isActive=true`
  - Paginated pharmacies with search and status filtering

### Pharmacy Operations

- **POST** `/admin/pharmacies`

  - Create new pharmacy
  - Body: CreatePharmacyAdminDto

- **PATCH** `/admin/pharmacies/:id`

  - Update pharmacy details
  - Body: UpdatePharmacyAdminDto

- **DELETE** `/admin/pharmacies/:id`

  - Delete pharmacy

- **PATCH** `/admin/pharmacies/:id/toggle-status`

  - Toggle pharmacy active status

- **GET** `/admin/pharmacies/:id/medicines`

  - Get all medicines available in a pharmacy

- **GET** `/admin/pharmacies/:id/reviews?page=1&limit=10`
  - Get reviews for a specific pharmacy

### Bulk Pharmacy Operations

- **POST** `/admin/bulk/pharmacies/activate`

  - Bulk activate pharmacies
  - Body: `{ "pharmacyIds": ["id1", "id2"] }`

- **POST** `/admin/bulk/pharmacies/deactivate`
  - Bulk deactivate pharmacies
  - Body: `{ "pharmacyIds": ["id1", "id2"] }`

## 6. Review Management

### List Reviews

- **GET** `/admin/reviews?page=1&limit=10&pharmacyId=uuid`
  - Paginated reviews with pharmacy filtering

### Review Operations

- **DELETE** `/admin/reviews/:id`
  - Delete a review

## 7. Search Functionality

### Search Across Entities

- **GET** `/admin/search/medicines?q=aspirin&category=care&page=1&limit=10`

  - Search medicines

- **GET** `/admin/search/users?q=john&page=1&limit=10`

  - Search users

- **GET** `/admin/search/pharmacies?q=pharmacy&page=1&limit=10`
  - Search pharmacies

## 8. System Configuration

### Configuration Data

- **GET** `/admin/config/categories`

  - Get all available medicine categories

- **GET** `/admin/config/order-statuses`
  - Get all available order statuses

## Data Transfer Objects (DTOs)

### CreateMedicineAdminDto

```typescript
{
  name: string;
  price: string;
  description?: string;
  image?: string;
  substance?: string;
  category?: string;
  stock?: boolean;
}
```

### UpdateMedicineAdminDto

All fields optional from CreateMedicineAdminDto

### CreatePharmacyAdminDto

```typescript
{
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  image?: string;
  isActive?: boolean;
  ownerId?: string;
}
```

### UpdatePharmacyAdminDto

All fields optional from CreatePharmacyAdminDto

## Response Format

All endpoints return responses in this format:

```typescript
{
  success: boolean;
  message: string;
  data: any;
  statusCode: number;
}
```

## Pagination Response Format

Paginated endpoints include metadata:

```typescript
{
  data: Array<any>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Authentication Headers

All requests must include:

```
Authorization: Bearer <jwt_token>
```

## File Upload

Image upload endpoints accept:

- Content-Type: multipart/form-data
- Field name: 'file'
- Max file size: 5MB
- Allowed formats: .png, .jpeg, .jpg

## Error Handling

The API returns appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

Consider implementing rate limiting for admin endpoints to prevent abuse.

## Logging

All admin actions should be logged for audit purposes.

## Security Considerations

1. All routes require admin authentication
2. Input validation on all DTOs
3. File upload security (type and size validation)
4. SQL injection protection through ORM
5. Proper error handling without exposing sensitive data
