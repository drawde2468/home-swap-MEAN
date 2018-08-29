const mongoose    = require('mongoose');
const Schema      = mongoose.Schema;

const matchSchema = new Schema({
  // userRequest1: {type : Schema.Types.ObjectId, ref: 'Requests'},
  // userRequest2: {type : Schema.Types.ObjectId, ref: 'Requests'},
  confirmed1: {type: Boolean, default: ''},
  confirmed2: {type: Boolean, default: ''},
  active: {type: Boolean, default: ''}
});

matchSchema.set('timestamps', true);

const Match = mongoose.model('Matches', matchSchema);

module.exports = Match;