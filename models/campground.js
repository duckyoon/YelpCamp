const mongoose = require('mongoose');
const Review = require('./review')
const User = require('./user')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    // []로 정의하는 경우 해당 Monogoose는 여러 개 가질 수 있는 배열로 인식한다. 따라서 campground.author.username 처럼 직접 접근 불가능
    // []로 정의했을 때는 campground.author[0].username 으로 접근해야 한다.
    author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);