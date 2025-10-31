# Admin User Setup Guide

## 🔐 Secure Admin Account Creation

### Prerequisites
- Docker containers running (MongoDB accessible on port 27017)
- MongoDB client or Docker exec access

### Method 1: Using MongoDB Shell

1. **Connect to MongoDB container:**
```bash
docker exec -it peraxis-mongodb mongosh -u admin -p peraxis123
```

2. **Switch to peraxis database:**
```javascript
use peraxis
```

3. **Create Admin Users:**
```javascript
// Create Admin User
db.admin_users.insertOne({
  email: "admin@peraxis.com",
  password: "$2a$10$N9qo8uLOickgx2ZrVzaKe.Q3J/r22wHbqc.eQHGOZlK4iO/H9QJ8u", // admin123
  role: "ADMIN",
  name: "Admin User",
  created_at: new Date(),
  status: "ACTIVE"
})

// Create Super Admin User  
db.admin_users.insertOne({
  email: "superadmin@peraxis.com", 
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // super123
  role: "SUPER_ADMIN",
  name: "Super Admin",
  created_at: new Date(),
  status: "ACTIVE"
})
```

### Method 2: Using Docker Exec Script

1. **Create setup script:**
```bash
# Create admin-setup.js file
cat > admin-setup.js << 'EOF'
use peraxis

db.admin_users.insertOne({
  email: "admin@peraxis.com",
  password: "$2a$10$N9qo8uLOickgx2ZrVzaKe.Q3J/r22wHbqc.eQHGOZlK4iO/H9QJ8u",
  role: "ADMIN", 
  name: "Admin User",
  created_at: new Date(),
  status: "ACTIVE"
})

db.admin_users.insertOne({
  email: "superadmin@peraxis.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", 
  role: "SUPER_ADMIN",
  name: "Super Admin", 
  created_at: new Date(),
  status: "ACTIVE"
})

print("Admin users created successfully!")
EOF
```

2. **Execute script:**
```bash
docker exec -i peraxis-mongodb mongosh -u admin -p peraxis123 < admin-setup.js
```

### Method 3: Custom Admin Creation

To create your own admin with custom credentials:

1. **Generate password hash:**
```bash
# Use online BCrypt generator or create Java utility
# BCrypt hash for your password (rounds: 10)
```

2. **Insert custom admin:**
```javascript
db.admin_users.insertOne({
  email: "your-email@company.com",
  password: "your-bcrypt-hash-here", 
  role: "SUPER_ADMIN",
  name: "Your Name",
  created_at: new Date(),
  status: "ACTIVE"
})
```

## 🔑 Default Login Credentials

**After running setup:**
- **Admin:** admin@peraxis.com / admin123
- **Super Admin:** superadmin@peraxis.com / super123

## 🛡️ Security Best Practices

### 1. Change Default Passwords
```javascript
// Update admin password
db.admin_users.updateOne(
  { email: "admin@peraxis.com" },
  { $set: { 
    password: "new-bcrypt-hash",
    updated_at: new Date()
  }}
)
```

### 2. Create Additional Admins
```javascript
db.admin_users.insertOne({
  email: "new-admin@peraxis.com",
  password: "bcrypt-hash-here",
  role: "ADMIN", // or "SUPER_ADMIN"
  name: "New Admin Name",
  created_at: new Date(),
  status: "ACTIVE",
  permissions: ["users", "products", "orders"] // optional
})
```

### 3. Disable/Remove Default Accounts
```javascript
// Disable default admin
db.admin_users.updateOne(
  { email: "admin@peraxis.com" },
  { $set: { status: "INACTIVE" }}
)

// Or delete completely
db.admin_users.deleteOne({ email: "admin@peraxis.com" })
```

## 📋 Verification

**Check admin users:**
```javascript
db.admin_users.find({}, { password: 0 }).pretty()
```

**Count admin users:**
```javascript
db.admin_users.countDocuments()
```

## 🚨 Production Security

1. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
2. **Enable 2FA** (implement in future versions)
3. **Regular password rotation** (every 90 days)
4. **Monitor login attempts** (check admin logs)
5. **Limit admin access** (IP whitelisting)
6. **Regular security audits**

## 🔧 Troubleshooting

**If login fails:**
1. Check admin_users collection exists
2. Verify password hash format
3. Check role spelling (ADMIN/SUPER_ADMIN)
4. Verify status is "ACTIVE"
5. Check application logs for errors

**Reset admin password:**
```javascript
// Generate new hash and update
db.admin_users.updateOne(
  { email: "admin@peraxis.com" },
  { $set: { 
    password: "$2a$10$newHashHere",
    updated_at: new Date()
  }}
)
```