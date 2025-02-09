let Product = require("../../sharedmb/schema/sellerProduct");

async function getProductCounts(req, res) {
    try {
        let totalCount,
            activeCount,
            inactiveCount,
            aboveZeroQuantityCount,
            zeroQuantityCount;
        const sellerId = req.query.sellerId || null;
        if (sellerId && sellerId !== null) {
            totalCount = await Product.countDocuments({
                sellerId: req.query.sellerId,
            });
            activeCount = await Product.countDocuments({
                sellerId: req.query.sellerId,
                isActive: true,
            });
            inactiveCount = await Product.countDocuments({
                sellerId: req.query.sellerId,
                isActive: false,
            });
            aboveZeroQuantityCount = await Product.countDocuments({
                sellerId: req.query.sellerId,
                quantity: { $gt: 0 },
            });
            zeroQuantityCount = await Product.countDocuments({
                sellerId: req.query.sellerId,
                quantity: 0,
            });
        } else {
            totalCount = await Product.countDocuments();
            activeCount = await Product.countDocuments({ isActive: true });
            inactiveCount = await Product.countDocuments({ isActive: false });
            aboveZeroQuantityCount = await Product.countDocuments({
                quantity: { $gt: 0 },
            });
            zeroQuantityCount = await Product.countDocuments({ quantity: 0 });
        }

        res.json({
            totalProducts: totalCount,
            activeProducts: activeCount,
            inactiveProducts: inactiveCount,
            productsWithQuantityAboveZero: aboveZeroQuantityCount,
            productsWithZeroQuantity: zeroQuantityCount,
        });
    } catch (error) {
        console.error("Error fetching product counts:", error);
        throw error;
    }
}

module.exports = [getProductCounts];
