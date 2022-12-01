const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean().populate('notes'); // lean removes unecessary properties / methods from the object
  if (!users?.length) {
    throw new CustomError.NotFoundError('No users found');
  }
  res.status(StatusCodes.OK).json(users);
});

// @desc Get single user
// @route GET /users/:id
// @access Private
const getSingleUser = asyncHandler(async (req, res) => {
  console.log('getting user.');
  const user = await User.findOne({ _id: req.params.id })
    .select('-password')
    .lean()
    .populate('notes');

  if (!user) {
    throw new CustomError.NotFoundError('User not found');
  }

  console.log(req.user);
  // checkPermissions(req.user,user._id);

  res.status(StatusCodes.OK).json({ user });
});

// @desc Create a new user
// @route POST /users
// @access Private
const createUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password) {
    throw new CustomError.BadRequestError(
      'Please provide username and password'
    );
  }

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password }
      : { username, roles, password };

  const duplicate = await User.findOne({ username })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    throw new CustomError.ConflictError(`Username ${username} already taken`);
  }

  const user = await User.create(userObject);

  if (user) {
    res
      .status(StatusCodes.CREATED)
      .json({ message: `New user ${username} created` });
  } else {
    throw new CustomError.BadRequestError('Please provide all fields');
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { username, roles, active, password } = req.body;
  const id = req.params.id;

  if (
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== 'boolean'
  ) {
    throw new CustomError.BadRequestError('All fields are required');
  }

  const user = await User.findById(id).exec();

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`);
  }

  const duplicate = await User.findOne({ username })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    throw new CustomError.ConflictError(`Username ${username} already taken`);
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = password;
  }

  const updateUser = await user.save();

  res
    .status(StatusCodes.OK)
    .json({ message: `${updateUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    throw new CustomError.BadRequestError('Please provide user ID');
  }

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    throw new CustomError.BadRequestError('User has assigned notes');
  }

  const user = await User.findById(id).exec();

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`);
  }

  if (user.username === req.user) {
    throw new CustomError.BadRequestError('Error deleting own user');
  }
  const result = await user.deleteOne();
  const message = `Username ${result.username} with ID ${result._id} deleted`;

  res.status(StatusCodes.OK).json({ message });
});

module.exports = {
  getAllUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
};
