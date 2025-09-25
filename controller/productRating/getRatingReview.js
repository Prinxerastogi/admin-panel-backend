const RatingReview = require('../../sharedmb/schema/ratingReview');

const getRating= async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'pending' } = req.query;
        
        const reviews = await RatingReview.aggregate([
            {
                $match: { 
                    status: status 
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: (page - 1) * parseInt(limit)
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                images: 1,
                                price: 1,
                                rating: 1,
                                id:1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                phoneNo: 1,
                                email: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: '$product'
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    rating: 1,
                    review: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isEdited: 1,
                    'product.name': 1,
                    'product.images': { $arrayElemAt: ['$product.images', 0] }, // Get first image
                    'product.price': 1,
                    'product.id':1,
                    'product.rating': 1,
                    'user.name': 1,
                    'user.phoneNo': 1,
                    'user.email': 1
                }
            }
        ]);

        const total = await RatingReview.countDocuments({ status });
        
        res.json({
            success: true,
            data: reviews,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                limit: parseInt(limit),
                totalRecords: total
            }
        });
        
    } catch (error) {
        console.error('Error fetching latest reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};
module.exports = getRating;

