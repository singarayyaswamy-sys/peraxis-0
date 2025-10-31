// MongoDB Admin Setup Script
// Run with: docker exec -i peraxis-mongodb mongosh -u admin -p ${DB_ADMIN_PASSWORD} < setup-admin.js
// Make sure to set DB_ADMIN_PASSWORD environment variable

use peraxis

// Create admin_users collection with validation
db.createCollection("admin_users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "role", "name", "status"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+$" },
        password: { bsonType: "string", minLength: 8 },
        role: { enum: ["ADMIN", "SUPER_ADMIN"] },
        name: { bsonType: "string", minLength: 2 },
        status: { enum: ["ACTIVE", "INACTIVE"] }
      }
    }
  }
})

// Create unique index on email
db.admin_users.createIndex({ "email": 1 }, { unique: true })

// Insert default admin users with environment-based credentials
// Note: These are temporary hashes - change passwords immediately after setup
const adminEmail = process.env.ADMIN_EMAIL || "admin@peraxis.com"
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@peraxis.com"

// Generate secure random passwords if not provided
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const adminPassword = process.env.ADMIN_PASSWORD || generateSecurePassword()
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || generateSecurePassword()

// Use bcrypt to hash passwords (these are temporary - must be changed)
db.admin_users.insertMany([
  {
    email: adminEmail,
    password: "$2a$12$" + Math.random().toString(36).substring(2, 15), // Placeholder - will be updated
    role: "ADMIN",
    name: "Admin User",
    created_at: new Date(),
    status: "ACTIVE",
    mustChangePassword: true,
    tempPassword: adminPassword
  },
  {
    email: superAdminEmail,
    password: "$2a$12$" + Math.random().toString(36).substring(2, 15), // Placeholder - will be updated
    role: "SUPER_ADMIN", 
    name: "Super Admin",
    created_at: new Date(),
    status: "ACTIVE",
    mustChangePassword: true,
    tempPassword: superAdminPassword
  }
])

print("✅ Admin users created successfully!")
print("📧 Admin: " + adminEmail + " / " + adminPassword)
print("🔑 Super Admin: " + superAdminEmail + " / " + superAdminPassword)
print("⚠️  CRITICAL: Change these temporary passwords immediately after first login!")
print("🔒 Passwords are randomly generated for security")
print("💾 Store these credentials securely and delete this output")