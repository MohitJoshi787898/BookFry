# BookFry Production Demo Login Credentials

Use these credentials to test all roles across BookFry (Admin Portal, Seller Dashboard, Customer Marketplace).

---

## 👑 Administrative Accounts (Access to `/admin/dashboard`)

| Role | Name | Email | Password | User ID |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | BookFry System Admin | `admin@bookfry.com` | `AdminBookFry123!` | `6a5e78809dc756b107f10318` |
| **Senior Moderator** | Senior Moderator Admin | `moderator@bookfry.com` | `ModBookFry123!` | `6a5e78809dc756b107f1031d` |

---

## 📚 Customer & Seller Accounts (Access to `/sell` & `/seller/dashboard`)

| Role | Name | Email | Password | User ID |
| :--- | :--- | :--- | :--- | :--- |
| **Demo User** | Mohit Joshi (Demo User) | `demouser@bookfry.com` | `DemoUser123!` | `6a5e6aebeb43c21dd04ccabd` |
| **John Seller** | John the Seller | `seller@example.com` | `password123` | - |
| **Alice Customer** | Alice Reader | `customer@example.com` | `password123` | - |

---

## 🔐 API Login Payload (`POST /api/v1/auth/login`)

```json
{
  "email": "admin@bookfry.com",
  "password": "AdminBookFry123!"
}
```
