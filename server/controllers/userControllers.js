const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean().populate('notes'); // lean removes unecessary properties / methods from the object
  if (!users?.length) {
    return res.status(400).json({ message: 'No users found' });
  }
  res.status(200).json(users);
});

// @desc Create a new user
// @route POST /users
// @access Private

const createUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: ' All fields are required' });
  }

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password }
      : { username, roles, password };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  console.log(roles);
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: ' All fields are required' });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    res.status(400).json({ message: 'User not found' });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = password;
  }

  const updateUser = await user.save();

  res.status(200).json({ message: `${updateUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID Required' });
  }

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: 'User has assigned notes' });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const result = await user.deleteOne();
  const message = `Username ${result.username} with ID ${result._id} deleted`;

  res.status(200).json({ message });
});

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
