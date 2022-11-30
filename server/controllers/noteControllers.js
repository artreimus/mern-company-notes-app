const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find()
    .lean()
    .populate({ path: 'user', select: 'username' });

  if (!notes?.length) {
    throw new CustomError.NotFoundError('No notes found');
  }

  res.status(StatusCodes.OK).json(notes);
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    throw new CustomError.BadRequestError(
      'Please provide user, title, and text'
    );
  }

  const isUserExist = await User.findById(user).exec();

  if (!isUserExist) {
    throw new CustomError.NotFoundError(`No user with id: ${user}`);
  }

  const duplicate = await Note.findOne({ title })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    throw new CustomError.ConflictError(`Note title ${title} already taken`);
  }

  const note = await Note.create({ user, title, text });

  if (note) {
    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'New note created' });
  } else {
    throw new CustomError.BadRequestError('Please provide all fields');
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    throw new CustomError.BadRequestError('All fields are required');
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    throw new CustomError.NotFoundError(`No note with id: ${id}`);
  }

  const isUserExist = await User.findById(user).exec();

  if (!isUserExist) {
    throw new CustomError.NotFoundError(`No user with id: ${user}`);
  }

  const duplicate = await Note.findOne({ title })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicate._id.toString() !== id) {
    throw new CustomError.ConflictError(`Note title ${title} already taken`);
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.status(StatusCodes.OK).json({ message: `${updatedNote.title} updated` });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    throw new CustomError.BadRequestError('Please provider note ID');
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    throw new CustomError.NotFoundError(`No note with id: ${id}`);
  }

  const result = await note.deleteOne();

  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.status(StatusCodes.OK).json({ message: reply });
});

module.exports = { getAllNotes, createNote, updateNote, deleteNote };
