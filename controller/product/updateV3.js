let productSchema = require("../../sharedmb/schema/product");
let sellerSchema = require("../../sharedmb/schema/sellerProduct");
let validate = require("express-validation");
let validation = require("./validation");
let panelTrack = require("../../sharedmb/schema/panelTack");
let updateProduct = (req, res) => {
    let product = req.body.product;
    
    productSchema.findOne({_id: req.body.productId}, (err, oldProduct) => {
        if (err) {
            console.log("Error fetching old product data:", err);
        }
        
        let updateProductDetails = { 
            description: product?.description ? product?.description : "",
            faq: product?.faq ? product?.faq : [],
            howToUse: product?.howToUse ? product?.howToUse : "",
            benefits: product?.benefits ? product?.benefits : "",
            nutritionalFacts: product?.nutritionalFacts
                ? product?.nutritionalFacts
                : [],
            country: product?.country ? product?.country : "",
            manufacturerDetails: product?.manufacturerDetails ? product?.manufacturerDetails : "",
            fssaiNo: product?.fssaiNo ? product?.fssaiNo : "",
        };
        
        let condition = {
            _id: req.body.productId,
        };
        let update = {
            $set: updateProductDetails,
        };
        
        productSchema.findOneAndUpdate(condition, update, (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error accured in hold product",
                    success: false,
                    error: err,
                });
            } else if (updated) {
                const modifiedFields = {};
                
                if (oldProduct) {
                    const fieldsToCheck = [
                        'description', 'faq', 'howToUse', 'benefits', 
                        'nutritionalFacts', 'country', 'manufacturerDetails', 'fssaiNo'
                    ];
                    
                    fieldsToCheck.forEach(field => {
                        const oldValue = oldProduct[field];
                        const newValue = updateProductDetails[field];
                        
                        if (Array.isArray(oldValue) || Array.isArray(newValue)) {
                            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                                modifiedFields[field] = {
                                    // oldValue: oldValue,
                                    newValue: newValue
                                };
                            }
                        } else if (oldValue !== newValue) {
                            modifiedFields[field] = {
                                // oldValue: oldValue,
                                newValue: newValue
                            };
                        }
                    });
                }
                
                if (Object.keys(modifiedFields).length > 0) {
                    panelTrack.create({
                        adminId: req.decoded.id ,
                        message: `Product details updated by ${req.decoded.role}`,
                        type: "productUpdate",
                        productId: req.body.productId,
                        data: {
                            modifiedFields: modifiedFields,
                            updateType: "productInformation"
                        }
                    });
                }
                
                res.status(200).json({
                    success: true,
                    message: "updated successfully.",
                });
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: "already updated" });
            }
        });
    });
};

module.exports = [validate(validation.updateProduct), updateProduct];