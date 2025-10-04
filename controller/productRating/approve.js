const RatingReview = require('../../sharedmb/schema/ratingReview');
const approve= async (req, res) => {
    try {
        const { reviewId } = req.params;
        const approvedBy = req.decoded.id;
        
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
                status: 'approved',
                approvedBy: approvedBy,
                approvedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name phoneNo email')
         .populate('productId', 'name images price');
                
        res.json({
            success: true,
            message: 'Review approved successfully',
            data: updatedReview
        });
        
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving review',
            error: error.message
        });
    }
};
module.exports = approve;