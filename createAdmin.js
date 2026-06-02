const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await mongoose.connect('mongodb+srv://khawsemanthan246_db_user:eELQg63jCmrr5elu@cluster0.wgoxtsk.mongodb.net/bca_erp?appName=Cluster0');
  const userSchema = new mongoose.Schema({
    name: String, email: String, password: String, role: String, isActive: Boolean
  }, { collection: 'users' });
  const User = mongoose.models.User || mongoose.model('User', userSchema);
  
  const existing = await User.findOne({ email: 'admin@bca.com' });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'System Admin', email: 'admin@bca.com', password: hashed, role: 'admin', isActive: true });
    console.log('Admin created: admin@bca.com / admin123');
  } else {
    console.log('Admin already exists');
  }
  process.exit(0);
}
createAdmin();
