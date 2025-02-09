let categorySchema = require("../../sharedmb/schema/category");
let async = require("async");
let crudModel = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");
const jsonfile = require("jsonfile");
const fse = require("fs-extra");

// new CronJob("0 34 19 * * *", function () {
//     console.log('Cron Job started for findproductCronTime');
//     findAllproducts()
// }, null, true, 'Asia/Kolkata');

// let findAllCategories = () => {
//     // let condition = {}
//     // crudModel.find(condition, productSchema, (err, products) => {
//     //     if (err) {
//     //         console.log(err)
//     //     }
//     //     else if (products && products.length > 0) {
//     //         products = JSON.parse(JSON.stringify(products));
//     // products = products.map((_)=>{
//     //     return {
//     //         _id : _._id,
//     //         id: _.id,

//     //         seo: _.seo
//     //     }
//     // })

//     // const file = 'product.json'
//     // //products = JSON.parse(JSON.stringify(products));
//     // jsonfile.writeFile(file, products, function (err) {
//     //     if (err) console.error(err)
//     // })
//     const dirTree = require("directory-tree");
//     let tree = dirTree("/var/www/developmentImage");
//     // const file = 'category.json';
//     categorySchema.find({},function (err, categories) {
//         if (err) console.error(err)
//         //console.log(products);
//         //updateImageLocation(products);
//         //console.log(categories);
//         let images = tree.children[3].children;
//         //console.log(images);
//         let i=0;
//         categories.map((category)=>{
//             images.map((image)=>{
//                 let cname = category.name.replace(/[^a-zA-Z0-9 &,]/g, '').replace(/ /g, '-');
//                 if(image.name == cname){
//                     console.log(i++, ' - ' ,image.name, ' - ' , cname);
//                     console.log(image.path);
//                     // fse.moveSync(image.path, 'home/piyush/backup/morningbag/images/production/30062020/newImages/cat/' + category.id, { overwrite: true })
//                     fse.copy(image.path, '/var/www/developmentImage/cat/' + category.id, err => {
//                         if (err) console.error(err)
//                         console.log('success! - ', i)
//                       })
//                 }
//             })
//         })
//     })
//     // jsonfile.readFile(file, )

//     // console.log(tree.children[3]);

//     //     }

//     // })
// }

let updateImageLocation = (products) => {
    //value.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '-')
    async.each(
        products,
        (product, callback) => {
            let condition = {
                _id: mongoose.Types.ObjectId(product._id),
            };
            // if(product.id==1013){
            //     console.log(product.id);
            // }
            let update = {
                $set: {
                    "seo.metaKeywords":
                        product.seo.metaKeywords &&
                        product.seo.metaKeywords.length > 0
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

// findAllCategories();
