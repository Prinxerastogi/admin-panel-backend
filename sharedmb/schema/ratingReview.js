let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ratingReviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, trim: true },
    isEdited: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'declined'], 
        default: 'pending' 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
    approvedAt: { type: Date },
    declinedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
    declinedAt: { type: Date },
    editHistory: [{
        oldRating: Number, 
        oldReview: String,
        editedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model("ratingReview", ratingReviewSchema);