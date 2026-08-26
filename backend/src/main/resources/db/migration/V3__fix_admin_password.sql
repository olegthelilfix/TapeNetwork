-- The V2 seed shipped a placeholder bcrypt hash that did not match its documented
-- password. Set the dev admin's password to a known value ("password") with a valid
-- BCrypt hash. CHANGE this in real environments.
update admin_user
   set password_hash = '$2y$10$2vE2177lBgclW1Xgbe.kAuBXO99GSUdY6DopBJDv3IaCH/Cpw9IBm'
 where email = 'admin@tape.local';
