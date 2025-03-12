const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    }
});

// 스키마에 자동으로 id, password를 추가해준다
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);