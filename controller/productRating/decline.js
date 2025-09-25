const RatingReview = require('../../sharedmb/schema/ratingReview');

const decline= async (req, res) => {
    try {
        const { reviewId } = req.params;
        const declinedBy = req.decoded.id;
        
        const review = await RatingReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        if (review.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Review is already ${review.status}`
            });
        }
        
        const updatedReview = await RatingReview.findByIdAndUpdate(
            reviewId,
            {
                status: 'declined',
                declinedBy: declinedBy,
                declinedAt: new Date(),
            },
            { new: true }
        ).populate('userId', 'name phoneNo email')
         .populate('productId', 'name images price');
        
        res.json({
            success: true,
            message: 'Review declined successfully',
            data: updatedReview
        });
        
    } catch (error) {
        console.error('Error declining review:', error);
        res.status(500).json({
            success: false,
            message: 'Error declining review',
            error: error.message
        });
    }
};
module.exports = decline;