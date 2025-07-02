const brand = require("../../sharedmb/schema/brand");
const mongoose = require("mongoose");

const deleteSubBrand = async (req, res) => {
    const id = req.query.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
    }

    try {
        const subBrand = await brand.findById(id);
        
        if (!subBrand) {
            return res.status(404).json({
                success: false,
                message: "SubBrand not found",
            });
        }
        
        if (subBrand.isRootBrand===true) {
            return res.status(403).json({
                success: false,
                message: "Cannot delete a Root Brand",
            });
        }

        if (subBrand.parentId) {
            const parent = await brand.findById(subBrand.parentId);
            
            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: "Parent brand not found",
                });
            }

            const result = await brand.updateOne(
                { _id: subBrand.parentId },
                { $pull: { childIds: mongoose.Types.ObjectId(id) } }
            );
            
            console.log('Update result:', result);

        }
        await brand.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "SubBrand deleted successfully",
        });

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            success: false,
            message: "Server error: " + err.message,
        });
    }
};

module.exports = [deleteSubBrand];