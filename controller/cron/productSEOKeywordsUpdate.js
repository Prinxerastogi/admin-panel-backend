let productSchema = require("../../sharedmb/schema/product");
let async = require("async");
let crudModel = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");
const jsonfile = require("jsonfile");

// new CronJob("0 34 19 * * *", function () {
//     console.log('Cron Job started for findproductCronTime');
//     findAllproducts()
// }, null, true, 'Asia/Kolkata');

let findAllProduct = () => {
  let condition = {};
  // crudModel.find(condition, productSchema, (err, products) => {
  //     if (err) {
  //         console.log(err)
  //     }
  //     else if (products && products.length > 0) {
  //         products = JSON.parse(JSON.stringify(products));
  //         products = products.map((_)=>{
  //             return {
  //                 _id : _._id,
  //                 id: _.id,
  //                 seo: _.seo
  //             }
  //         })

  //         const file = 'product.json'
  //         products = JSON.parse(JSON.stringify(products));
  //         jsonfile.writeFile(file, products, function (err) {
  //             if (err) console.error(err)
  //         })

  const file = "product.json";
  jsonfile.readFile(file, function (err, products) {
    if (err) console.error(err);
    //console.log(products);
    updateSeoKeeywords(products);
  });
  //     }

  // })
};

let updateSeoKeeywords = (products) => {
  async.each(
    products,
    (product, callback) => {
      let condition = {
        _id: new mongoose.Types.ObjectId(product._id),
      };
      // if(product.id==1013){
      //     console.log(product.id);
      // }
      let update = {
        $set: {
          "seo.metaKeywords":
            product.seo.metaKeywords && product.seo.metaKeywords.length > 0
              ? product.seo.metaKeywords[0][0]
              : "",
        },
      };
      let Option = {};
      console.log(
        product.id,
        " - ",
        product.seo.metaKeywords && product.seo.metaKeywords.length > 0
          ? product.seo.metaKeywords[0][0]
          : ""
      );

      // crudModel.updateOne(condition, update, Option, productSchema, (err, updated) => {
      //     if (err) {
      //         callback({ error: true, success: false, message: 'error occured in upadte product metakey word.' });

      //     }
      //     else {
      //         callback();
      //     }
      // })
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("all done");
      }
    }
  );
};

//findAllProduct();
