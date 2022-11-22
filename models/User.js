const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide username'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide user password'],
    },
    roles: [
      {
        type: String,
        enum: ['Employee', 'Admin'],
        default: 'Employee',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { toJSON: { virtuals: { virtuals: true } }, toObject: { virtual: true } }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

module.exports = mongoose.model('User', userSchema);
