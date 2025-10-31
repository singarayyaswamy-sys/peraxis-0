-- Sample serviceable zones for major Indian cities
INSERT IGNORE INTO serviceable_zones (pincode, city, state, serviceable, delivery_days, free_delivery_threshold, delivery_charge) VALUES
('500001', 'Hyderabad', 'Telangana', true, 1, 500.0, 40.0),
('500081', 'Hyderabad', 'Telangana', true, 1, 500.0, 40.0),
('110001', 'New Delhi', 'Delhi', true, 2, 500.0, 50.0),
('400001', 'Mumbai', 'Maharashtra', true, 2, 500.0, 60.0),
('560001', 'Bangalore', 'Karnataka', true, 1, 500.0, 40.0),
('600001', 'Chennai', 'Tamil Nadu', true, 2, 500.0, 50.0),
('700001', 'Kolkata', 'West Bengal', true, 3, 500.0, 50.0),
('411001', 'Pune', 'Maharashtra', true, 2, 500.0, 45.0),
('380001', 'Ahmedabad', 'Gujarat', true, 2, 500.0, 45.0),
('302001', 'Jaipur', 'Rajasthan', true, 3, 500.0, 55.0);

-- Sample warehouses
INSERT IGNORE INTO warehouses (name, address, city, state, pincode, latitude, longitude, active) VALUES
('Hyderabad Main Warehouse', 'HITEC City, Madhapur', 'Hyderabad', 'Telangana', '500081', 17.4485, 78.3908, true),
('Delhi Central Warehouse', 'Connaught Place', 'New Delhi', 'Delhi', '110001', 28.6139, 77.2090, true),
('Mumbai Port Warehouse', 'Nariman Point', 'Mumbai', 'Maharashtra', '400001', 18.9220, 72.8347, true),
('Bangalore Tech Warehouse', 'Electronic City', 'Bangalore', 'Karnataka', '560001', 12.9716, 77.5946, true),
('Chennai South Warehouse', 'T. Nagar', 'Chennai', 'Tamil Nadu', '600001', 13.0827, 80.2707, true);