-- Create missing databases
CREATE DATABASE IF NOT EXISTS peraxis_location;
CREATE DATABASE IF NOT EXISTS peraxis_main;
CREATE DATABASE IF NOT EXISTS peraxis_products;
CREATE DATABASE IF NOT EXISTS peraxis_activities;

-- Grant permissions
GRANT ALL PRIVILEGES ON peraxis_location.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON peraxis_main.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON peraxis_products.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON peraxis_activities.* TO 'root'@'%';
FLUSH PRIVILEGES;
