const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['ADMIN', 'OPERATOR', 'VIEWER'],
    default: 'VIEWER',
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual setter for plain password – hashes automatically
userSchema.virtual('password')
  .set(function (plain) {
    if (plain) {
      this.passwordHash = bcrypt.hashSync(plain, SALT_ROUNDS);
    }
  });

// Method to compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compareSync(candidate, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
