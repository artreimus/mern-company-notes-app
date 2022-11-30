const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find()
    .lean()
    .populate({ path: 'user', select: 'username' });

  if (!notes?.length) {
    return res.status(400).json({ message: 'No notes found' });
  }

  res.json(notes);
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const isUserExist = await User.findById(user).exec();

  if (!isUserExist) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  const note = await Note.create({ user, title, text });

  if (note) {
    return res.status(201).json({ message: 'New note created' });
  } else {
    return res.status(400).json({ message: 'Invalid note data received' });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  const isUserExist = await User.findById(user).exec();

  if (!isUserExist) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json({ message: `${updatedNote.title} updated` });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Note ID required' });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  const result = await note.deleteOne();

  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json({ message: reply });
});

module.exports = { getAllNotes, createNote, updateNote, deleteNote };
