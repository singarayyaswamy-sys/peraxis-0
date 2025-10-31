// MongoDB Admin Setup Script for Port 27018
// Run with: docker exec -i peraxis-mongodb mongosh -u admin -p peraxis123 < setup-admin-mongodb-27018.js

use peraxis

// Create Admin Users Collection with proper indexes
db.createCollection("admin_users")
db.admin_users.createIndex({ "email": 1 }, { unique: true })
db.admin_users.createIndex({ "role": 1 })
db.admin_users.createIndex({ "status": 1 })

// Insert Admin User
db.admin_users.insertOne({
  email: "admin@peraxis.com",
  password: "$2a$10$N9qo8uLOickgx2ZrVzaKe.Q3J/r22wHbqc.eQHGOZlK4iO/H9QJ8u", // admin123
  role: "ADMIN",
  name: "Admin User",
  created_at: new Date(),
  updated_at: new Date(),
  status: "ACTIVE",
  permissions: ["users", "products", "orders", "analytics"]
})

// Insert Super Admin User  
db.admin_users.insertOne({
  email: "superadmin@peraxis.com", 
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // super123
  role: "SUPER_ADMIN",
  name: "Super Admin",
  created_at: new Date(),
  updated_at: new Date(),
  status: "ACTIVE",
  permissions: ["*"]
})

// Create other necessary collections
db.createCollection("products")
db.products.createIndex({ "name": "text", "description": "text" })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "status": 1 })
db.products.createIndex({ "created_at": -1 })

db.createCollection("categories")
db.categories.createIndex({ "name": 1 }, { unique: true })
db.categories.createIndex({ "status": 1 })

// Insert sample categories
db.categories.insertMany([
  {
    name: "Electronics",
    description: "Electronic devices and gadgets",
    status: "ACTIVE",
    created_at: new Date()
  },
  {
    name: "Clothing",
    description: "Fashion and apparel",
    status: "ACTIVE",
    created_at: new Date()
  },
  {
    name: "Home & Garden",
    description: "Home improvement and garden supplies",
    status: "ACTIVE",
    created_at: new Date()
  }
])

print("✅ Admin users created successfully!")
print("✅ Database collections and indexes created!")
print("✅ Sample categories added!")
print("")
print("Login Credentials:")
print("Admin: admin@peraxis.com / admin123")
print("Super Admin: superadmin@peraxis.com / super123")
print("")
print("MongoDB is running on port 27018")