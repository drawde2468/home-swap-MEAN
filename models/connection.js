const mongoose    = require('mongoose');
const Schema      = mongoose.Schema;

const connectionSchema = new Schema({
  user1: {type : Schema.Types.ObjectId, ref: 'Users'},
  user2: {type : Schema.Types.ObjectId, ref: 'Users'},
  userRequest1: {type : Schema.Types.ObjectId, ref: 'Travels'},
  userRequest2: {type : Schema.Types.ObjectId, ref: 'Travels'},
  confirmed1: {type: Boolean, default: false},
  confirmed2: {type: Boolean, default: false},
  active: {type: Boolean, default: true}
});

connectionSchema.set('timestamps', true);

const Connection = mongoose.model('Connections', connectionSchema);

module.exports = Connection;