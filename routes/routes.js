let express = require("express");
let controller = require("../controller");
let apiRoutes = express.Router();

apiRoutes.get("/home", controller.home); ////not in use

apiRoutes.post("/addHomeScreenCard", controller.HomeScreen.create);
apiRoutes.post("/modifyHomeScreenCard", controller.HomeScreen.modify);
apiRoutes.get("/listHomeScreenCard", controller.HomeScreen.list);
apiRoutes.get("/getHomeScreen", controller.HomeScreen.get);
apiRoutes.post("/deleteHomeScreen", controller.HomeScreen.delete);
////apiRoutes.post('/expire/promocode',             controller.cronjob.expireOffer);
apiRoutes.get("/category/subcategory", controller.category.subCategory);

////apiRoutes.post('/seller/order/paid',            controller.cronjob.orderPaidToSeller);//not in use
/////apiRoutes.post('/seller/delivery/paid',         controller.cronjob.deliveryPaidToSeller);//not in use
/////apiRoutes.post('/seller/find/paid',             controller.cronjob.deliveryPaidToSellerCron);//not in use

apiRoutes.post("/addTags", controller.tags.addTags);
apiRoutes.put("/updateTags", controller.tags.updateTags);
apiRoutes.get("/taglist", controller.tags.tagsList);
apiRoutes.get("/getTag/:tag_id", controller.tags.getTagDetails);
apiRoutes.get("/deleteTag/:tag_id", controller.tags.deleteTag);

apiRoutes.post("/compare/product", controller.cron.compareProduct);

////apiRoutes.post('/subscription/notaccepted',   controller.cronjob.refundAmountToUser)
////apiRoutes.post('/refundamount',               controller.cronjob.refundAmountToUser);

////apiRoutes.post('/complete/subscription',        controller.cronjob.completeSubscription);//not in use
////apiRoutes.post('/send/mail/before/3days',       controller.cronjob.sendEmail);//not in use

// apiRoutes.get('/user/latest/list/csv',          controller.user.download.latestUsercsv);

apiRoutes.post("/login", controller.admin.login);
apiRoutes.get("/routes", controller.apiRoutes.list);
apiRoutes.get("/offer/orders", controller.offer.OfferOrders);
apiRoutes.use(controller.middleware.tokenmiddleware);
// apiRoutes.use(controller.middleware.aclmiddeleware)
apiRoutes.post("/remove/product/image", controller.image.removeProductImage);
apiRoutes.post("/remove/category/image", controller.category.deleteImage);

apiRoutes.get(
    "/assign/seller/area/:sellerId",
    controller.seller.area.polygonDetails
);
apiRoutes.post("/assign/seller/area", controller.seller.area.assign);

apiRoutes.post("/add/serveArea", controller.seller.servingArea.add);
apiRoutes.get("/serveArea/:id", controller.seller.servingArea.get);
apiRoutes.get("/serveArea/detail/:id", controller.seller.servingArea.detail);
apiRoutes.put("/serveArea/update/:id", controller.seller.servingArea.update);
apiRoutes.delete("/serveArea/delete/:id", controller.seller.servingArea.delete);
apiRoutes.get("/subAreas", controller.seller.servingArea.getAllSubArea);
apiRoutes.post("/assign/serveArea", controller.seller.servingArea.assign);

apiRoutes.put("/admin/active/deactive", controller.admin.activeDeactive);
apiRoutes.get("/admins", controller.admin.list);
apiRoutes.get("/admin", controller.admin.view);
apiRoutes.put("/admin", controller.admin.update);
apiRoutes.post("/admin", controller.admin.create);

apiRoutes.get("/state", controller.state.list);
apiRoutes.post("/city", controller.city.add);
apiRoutes.get("/city", controller.city.list);
apiRoutes.delete("/city/:id", controller.city.delete);
//apiRoutes.put('/area/city', controller.city.areaAdd);//not inh use
////apiRoutes.get('/area/city', controller.city.getArea);//not in use
////apiRoutes.post('/area/city',controller.city.updateArea);//not in use
////apiRoutes.post('/city/active/deactive', controller.city.activeDeactive);

/***************************society********************** */
apiRoutes.put("/society", controller.society.add);
apiRoutes.put("/society/flat", controller.society.addFlat);
apiRoutes.put("/society/block", controller.society.addBlock);
apiRoutes.put("/society/:id", controller.society.update);
apiRoutes.get("/society", controller.society.get);
apiRoutes.put("/area/society", controller.society.areaAdd); //not in use
////apiRoutes.get('/area/society',  controller.society.getArea);//not in use
apiRoutes.get("/society/flat", controller.society.getFlatList);
apiRoutes.get("/society/block", controller.society.getBlockList);
//apiRoutes.post('/area/society',  controller.society.areaAdd); // not in use

apiRoutes.get("/seller/list", controller.seller.list);
apiRoutes.get("/city/seller", controller.seller.citySellers);
apiRoutes.post("/city/seller", controller.seller.setCity);
apiRoutes.put(
    "/seller/activate/deactivate",
    controller.seller.activateDeactivateSeller
);
apiRoutes.get("/seller/profile", controller.seller.profile);
apiRoutes.post("/seller/profile", controller.seller.editProfile);
apiRoutes.post("/seller/profile/verify", controller.seller.verifyProfile);
apiRoutes.post(
    "/seller/profile/verify/full",
    controller.seller.verifyProfileFull
);
apiRoutes.get("/seller/profile/verify", controller.seller.verifylist);

/***************************supplier********************** */
apiRoutes.get("/supplier", controller.supplier.list);
apiRoutes.put("/supplier/approve/:supplierId", controller.supplier.approve);
apiRoutes.put("/supplier/activate/:supplierId", controller.supplier.activate);
apiRoutes.get("/supplier/:supplierId", controller.supplier.details);
apiRoutes.put("/supplier/:supplierId", controller.supplier.update);

////apiRoutes.get('/category/root',                controller.category.rootCategory);
apiRoutes.post("/category/root", controller.category.addRootCategory);
apiRoutes.post("/category/subcategory", controller.category.addSubCategory);

apiRoutes.put("/category/update", controller.category.update);
apiRoutes.delete("/category/delete", controller.category.delete);

apiRoutes.post("/attribute", controller.attribute.addAttribute);
apiRoutes.get("/attribute/all", controller.attribute.getAllAttribute);
apiRoutes.get("/attribute", controller.attribute.getAttribute);
apiRoutes.put("/attribute", controller.attribute.updateAttribute);
apiRoutes.put("/attribute/bind", controller.category.bindAttribute);
apiRoutes.get("/attribute/bind", controller.category.getAttributeOfCategory);
apiRoutes.get("/category/attribute", controller.category.categoryAttributeList);

apiRoutes.get("/category/tree", controller.category.treeView); //not in use
apiRoutes.get("/category/tree/v2", controller.category.treeViewV2);
apiRoutes.get("/check/leaf", controller.category.checkLeaf);

apiRoutes.post("/product/add", controller.product.addProductV2);
apiRoutes.get("/product/exportCsv", controller.product.exportCsv);
apiRoutes.post("/product/add/bulk", controller.product.bulkAddProductByExcel);
apiRoutes.post("/product/add/exel", controller.product.addProductByExel);
apiRoutes.post("/product/approval", controller.product.approved);
apiRoutes.get("/product", controller.product.view);
apiRoutes.post(
    "/seller/added/product/approval",
    controller.product.seller.approved
);
apiRoutes.get("/nonapproval/products", controller.product.notApprovedProducts);
apiRoutes.get(
    "/seller/nonapproval/products",
    controller.product.seller.notApprovedProductList
);
apiRoutes.get("/exportProductList", controller.product.exportProductList);

apiRoutes.get("/products/bycategory", controller.product.productListBycategory);
apiRoutes.post("/product/hold", controller.product.hold);
apiRoutes.get("/product/search", controller.search.productSearch);
apiRoutes.get("/category/search", controller.search.categorySearch);
apiRoutes.get("/product/status", controller.product.productListByStatus);
apiRoutes.get("/product/list", controller.product.productList);
apiRoutes.post("/product/active/deactive", controller.product.activeDeactive);
apiRoutes.get(
    "/child/product/:parentProductId",
    controller.product.getChildProduct
);

apiRoutes.put("/product/update", controller.product.update);
apiRoutes.put("/product/update/v2", controller.product.updateV2);
apiRoutes.put("/product/update/v3", controller.product.updateV3);
apiRoutes.post("/product/findbarcode", controller.product.findBarcode);

apiRoutes.get("/brands", controller.brand.show);
apiRoutes.post("/brand", controller.brand.add);
apiRoutes.put("/brand", controller.brand.update);
apiRoutes.get("/brand", controller.brand.view);
apiRoutes.post("/add/subbrand", controller.brand.addSubBrand);
apiRoutes.delete("/brand/:id", controller.brand.remove);
apiRoutes.get("/subbrands", controller.brand.subBrands); //not is use

apiRoutes.get("/offer/type", controller.offer.offerType);

apiRoutes.get("/offer/:offerId", controller.offer.get);
apiRoutes.post("/offer", controller.offer.add);
apiRoutes.put("/offer/:offerId", controller.offer.update);
apiRoutes.post("/offer/active/deactive", controller.offer.activeDeactive);
apiRoutes.get("/offergraph/:id", controller.offer.graph);
////apiRoutes.post('/gst',                        controller.gst.add);
apiRoutes.get("/gst", controller.gst.list);
////apiRoutes.put('/gst',                         controller.gst.update);
////apiRoutes.get('/search/gst',                  controller.gst.search);

apiRoutes.post("/membership", controller.membership.add);
apiRoutes.get("/membership", controller.membership.get);
apiRoutes.put("/membership", controller.membership.activeDeactive);
apiRoutes.put("/update/membership", controller.membership.update);

apiRoutes.post("/notification", controller.notification.add);
apiRoutes.get("/notification", controller.notification.get);
apiRoutes.put("/notification", controller.notification.activeDeactive);

apiRoutes.get("/issues", controller.issue.list);
apiRoutes.get("/issue", controller.issue.view);
apiRoutes.post("/issue/close", controller.issue.closed);
apiRoutes.get("/issue/message", controller.issue.message.list);
apiRoutes.post("/issue/raise", controller.issue.raiseIssue);

apiRoutes.get("/keywords", controller.keyword.list);

apiRoutes.get("/users", controller.user.list);
apiRoutes.get("/search/users", controller.user.serach);
apiRoutes.get("/latest/users", controller.user.latestUserList);
apiRoutes.get("/user", controller.user.view);
apiRoutes.post("/reactivateUser", controller.user.reactivateUser);

// apiRoutes.post("/adminUser", controller.user.create);
// apiRoutes.put("/adminUser", controller.user.modify);
// apiRoutes.post("/adminUser/changePass", controller.user.changePassword);
// apiRoutes.get("/adminUser", controller.user.list);
// apiRoutes.post("/adminUser/active", controller.user.activateDeactivate);

apiRoutes.get("/user/order/list/csv", controller.user.download.userOrdercsv);

apiRoutes.post(
    "/productfamily/addfamily",
    controller.product.productfamily.add
);
apiRoutes.get(
    "/productfamily/getproduct",
    controller.product.productfamily.getproduct
);
apiRoutes.get(
    "/productfamily/getfamily",
    controller.product.productfamily.getfamily
);
apiRoutes.get(
    "/productfamily/getfamilyname",
    controller.product.productfamily.getfamilyname
);
apiRoutes.put(
    "/productfamily/addproduct",
    controller.product.productfamily.update
);
apiRoutes.put(
    "/productfamily/productremove",
    controller.product.productfamily.productremove
);
apiRoutes.put(
    "/productfamily/deletefamily",
    controller.product.productfamily.deleteproductfamily
);
apiRoutes.put(
    "/productfamily/updatefamilyname",
    controller.product.productfamily.updatefamilyname
);

apiRoutes.put("/upload", controller.image.image);
apiRoutes.post("/remove", controller.image.remove);

apiRoutes.post("/update/product/image", controller.image.updateProductImage);

//admin
apiRoutes.post("/role", controller.role.add);
apiRoutes.get("/role", controller.role.list);
apiRoutes.delete("/role", controller.role.remove);
apiRoutes.put("/role", controller.role.update);

//referalcode
apiRoutes.post("/referal", controller.referal.add);
apiRoutes.get("/referals", controller.referal.list);
apiRoutes.put("/referal", controller.referal.update);

//vouchercode
apiRoutes.post("/vouchercode", controller.vouchercode.add);
apiRoutes.get("/vouchercode", controller.vouchercode.list);
apiRoutes.put("/vouchercode", controller.vouchercode.activeDeactive);

//cashRequest
apiRoutes.get("/cashrequest", controller.cashRequest.list);
apiRoutes.post("/generate/Voucher", controller.cashRequest.genarateVoucherCode);

//saerchKeywords
apiRoutes.get("/search/keywords", controller.searchKeyword.list);

apiRoutes.get("/dashboard", controller.dashboard.get);
apiRoutes.get("/dashboard/stats", controller.dashboard.stats);
apiRoutes.get("/dashboard/orderreport", controller.dashboard.orderreport);
apiRoutes.get("/dashboard/graphreport", controller.dashboard.graphreport);
apiRoutes.get("/dashboard/topproducts", controller.dashboard.topProducts);
apiRoutes.get("/dashboard/dailyStat", controller.dashboard.dailyStats);
apiRoutes.get("/dashboard/productCount", controller.dashboard.productsCount);
apiRoutes.get("/dashboard/orderSource", controller.dashboard.orderSource);

apiRoutes.get("/seller/orders", controller.seller.orderGraph);
apiRoutes.get("/seller/ordersCancel", controller.seller.dashboardData);
apiRoutes.get("/orders", controller.order.orderList);
apiRoutes.get("/user/orders", controller.order.userOrders);
apiRoutes.get("/order", controller.order.view);
apiRoutes.get("/orderCsv", controller.order.exportOrderCsv);

apiRoutes.get("jobs/details", controller.jobs.details);

//Blog
apiRoutes.post("/blog", controller.blog.add);
apiRoutes.get("/blog/:blogId", controller.blog.get);
apiRoutes.get("/blog", controller.blog.list);
apiRoutes.put("/blog", controller.blog.update);
apiRoutes.delete("/blog", controller.blog.delete);

//apk
apiRoutes.post("/apk", controller.apk.add);
apiRoutes.get("/apk/:apkId", controller.apk.get);
apiRoutes.get("/apk", controller.apk.list);
apiRoutes.put("/apk", controller.apk.update);
apiRoutes.delete("/apk", controller.apk.delete);
apiRoutes.put("/apk/active", controller.apk.active);

//Banner
apiRoutes.post("/banner", controller.banner.add);
apiRoutes.get("/banner/:bannerId", controller.banner.get);
apiRoutes.get("/banner", controller.banner.list);
apiRoutes.put("/banner", controller.banner.update);
apiRoutes.delete("/banner", controller.banner.delete);
apiRoutes.put("/banner/active/deactive", controller.banner.activeDeactive);

//payments
apiRoutes.get("/user/payments", controller.transation.list);
apiRoutes.get("/user/payment", controller.transation.view);

//refund
apiRoutes.get("/order/refund", controller.refund.orderRefundList);
apiRoutes.post("/order/refund", controller.refund.orderRefund);

//setting
//apiRoutes.post('/setting',                   controller.setting.add);
apiRoutes.put("/setting", controller.setting.update);
apiRoutes.get("/setting", controller.setting.list);

//return
apiRoutes.post("/order/return", controller.order.return);

//return
apiRoutes.get("/transection/sms/balance", controller.transactionSms.get);

//infoPage
apiRoutes.get("/infopage", controller.info.list);
apiRoutes.get("/infopage/:id", controller.info.detail);
apiRoutes.post("/infopage", controller.info.create);
apiRoutes.put("/infopage/:id", controller.info.update);
apiRoutes.put("/infopage/status/:id", controller.info.changeStatus);
apiRoutes.put("/infopage/delete/:id", controller.info.deleteInfoPage);
apiRoutes.put("/infopage/remove/image/:id", controller.info.deleteImages);

// chat routes
apiRoutes.get("/chats", controller.chat.list);
apiRoutes.get("/chat/:orderId", controller.chat.detail);

apiRoutes.get("/chatbot/listAll", controller.chatbot.listAll);
apiRoutes.get("/chatbot/listTickets", controller.chatbot.listTickets);
apiRoutes.get("/chatbot/viewTicket", controller.chatbot.viewTicket);
apiRoutes.post("/chatbot/resumeTicket", controller.chatbot.resumeTicket);
apiRoutes.put("/chatbot/upload", controller.chatbot.image);
apiRoutes.post("/chatbot/openNew", controller.chatbot.openNew);
apiRoutes.post("/chatbot/resolveTicket", controller.chatbot.resolveTicket);

// otp limit routes
apiRoutes.post("/otp/limit", controller.otpLimit.add);
apiRoutes.put("/otp/limit", controller.otpLimit.update);
apiRoutes.get("/otp/limit", controller.otpLimit.detail);

apiRoutes.get(
    "/deliveryboy/withdrawalRequests",
    controller.deliveryBoy.withdrawalReqList
);
apiRoutes.post(
    "/deliveryboy/acceptrequest",
    controller.deliveryBoy.acceptWithdrawalRequest
);
apiRoutes.post(
    "/deliveryboy/rejectrequest",
    controller.deliveryBoy.rejectRequest
);
apiRoutes.post(
    "/deliveryboy/adjustearning",
    controller.deliveryBoy.adjustEarning
);
apiRoutes.get(
    "/deliveryboy/bankaccountDetails",
    controller.deliveryBoy.bankdetails
);

apiRoutes.post("/importCsvAndUpdate", controller.product.importCsvAndUpdate);

apiRoutes.post(
    "/deliveryboy/changeBankAccount",
    controller.deliveryBoy.changeBankAccount
);
apiRoutes.post("/addWalletMoney", controller.wallet.addWalletMoney);

apiRoutes.get("/campaign", controller.campaigns.getCampaignDetails);
apiRoutes.get("/campaign/list", controller.campaigns.listCampaign);
apiRoutes.post("/campaign/create", controller.campaigns.createCampaign);
apiRoutes.post("/campaign/complete", controller.campaigns.completeCampaign);
apiRoutes.post("/campaign/start", controller.campaigns.startCampaign);
apiRoutes.post("/campaign/test", controller.campaigns.testCampaign);
module.exports = apiRoutes;
