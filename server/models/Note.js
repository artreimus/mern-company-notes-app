const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please provide note user'],
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please provide note title'],
      index: {
        unique: true,
        collation: { locale: 'en', strength: 2 },
      },
    },
    text: {
      type: String,
      required: [true, 'Please provide note text'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

noteSchema.plugin(AutoIncrement, {
  inc_field: 'ticket',
  id: 'ticketNumbers',
  start_seq: 500,
});

module.exports = mongoose.model('Note', noteSchema);
