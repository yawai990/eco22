const Products = require('../models/productsModel');
const recordsPerPage= require('../config/pagination');
const imageValidate = require('../utils/imageValidate');

const getProducts=async (req,res,next)=>{

    try{    
        var query={};
        let queryCondition = false;
        let priceQuery ={};

        if(req.query.price){

            queryCondition = true;
                    //$lte selects the documents where the value of the field is less than or equal to (i.e. <=) the specified value.
            priceQuery = {price:{$lte:Number(req.query.price)}}
        }

        let ratingQuery = {};

        if(req.query.rating){
            queryCondition = true;
            //$in operator selects the documents where the value of a field equals any value in the specified array
                            ratingQuery = {rating:{$in:req.query.rating.split(',')}}
         };

         const categoryName =req.params.categoryName || '';

         
        let categoryQuery ={};

         if(categoryName){
            queryCondition = true;
             let a =categoryName.replaceAll(',' , '/');
             var regEx = new RegExp('^' + a);

             categoryQuery={category:regEx}
         }

         if(req.query.category){
            queryCondition=true;

            //following return like that [/^abced/,/^defg/]
            let check =req.query.category.split(',').map(item=>{
                if(item) return new RegExp(`^${item}`)
             });

             categoryQuery = {category:{$in:check}}
         };

         let attrsQuery = {};
         if(req.query.attrs){
            attrsQuery = req.query.attrs.split(',').reduce((acc,item)=>{
           if(item){
            //RAM-1 TB-2TB
            const a= item.split('-');

            let values =[...a];

            values.shift() //remove first element (e.g RAM)
            let a1 ={
                attrs:{$elemMatch:{key:a[0],value:{$in:values}}}
            };

            acc.push(a1)
            return acc
           }else {
            return acc
           };
           },[]);
            queryCondition = true;
         };


         const searchQuery=req.params.searchQuery || '';

         const pageNum = req.query.pageNum || 1;

         //check how many have the products in the db
         let sort ={};
         const sortOption = req.query.sort || '';  //sortOption = 'price_1' -1 
         
         if(sortOption){
             const sortOpt = sortOption.split("_"); //   [price,1]
             
             sort ={ [sortOpt[0]]:Number(sortOpt[1])}
         };
        
         let searchQueryCondition = {};
         let select = {};
         if(searchQuery){
             queryCondition = true;
             searchQueryCondition ={ $text:{ $search: searchQuery }};

             //{$meta:'textScore'} gives us search rates for the something;
             select ={
                score:{$meta:'textScore'}
             };
             sort = {score:{$meta:'textScore'}};
         };
         

         if(queryCondition){
         query ={
                 $and:[priceQuery,ratingQuery,categoryQuery,searchQueryCondition],
                };
         };

        const totalProducts = await Products.countDocuments(query);


        //1 = ascending  -1 = descending
        const products = await Products.find(query)
                                       .select(select)
                                       .skip(recordsPerPage * (pageNum - 1))
                                       .sort(sort)
                                       .limit(recordsPerPage);

        res.status(200).json(
            {
                products,
                pageNum,
                paginationLinksNumber:Math.ceil(totalProducts / recordsPerPage)
            }
            );
    }catch(err){
   next(err)
    }
};

const getProductById =async(req,res,next)=>{
        const id=req.params.id;

        try {

            //populte take the data from other document
               const idProduct = await Products.findById(id).populate("reviews").orFail();

               res.status(200).json(idProduct)  
        } catch (error) {
            next(error)
        }
};

const getBestsellers = async(req,res,next)=>{
    try {
        const products = await Products.aggregate([
            { $sort : { category :1, sales : -1 } },
            { $group : { _id : "$category",doc_with_max_sales : { $first: "$$ROOT" } } },
            { $replaceWith: '$doc_with_max_sales' },
            { $match : { sales : { $gt : 0 } } },
            //get the things that i want from db
            { $project: { _id : 1, name:1, category: 1, images: 1, description: 1 } },
            { $limit : 3}
        ]);

        res.status(200).json(products)
    } catch (error) {
        next(error)
    }
};

const adminGetProducts = async( req,res,next ) =>{
    
    try {
            const products = await Products.find({})
                                                                .sort( { category : 1 } )
                                                                //select get the field data only that u insert in the select
                                                                .select( " name price category" )
                                                                .orFail()

            res.status(200).json(products)
    } catch (error) {
        next(error)
    }
};

const adminDeleteProduct = async ( req, res, next )=>{

    const id = req.params.id; 
     
    try {
        const product = await Products.findById(id).orFail();

        product.remove();

        res.json({message:'Product removed'})
    } catch (error) {
            next(error)
    }
};

const adminCreateProduct = async ( req,res ,next)=>{

    try {   
        const { name, description, category, count, price, attrsTable } = req.body;

        const newProductData = { name,description,category,count,price,attrs:attrsTable};

        const product = new Products(newProductData);

        product.save();

        res.status(201).json({
            message:'Product created',
            productId:product._id
        });
         
    } catch (error)  {
        next(error)
    }

};

const adminUpdateProduct = async ( req, res, next)=>{
    try {   

        //get the prodcut id from url which u wanna update;
        const id = req.params.id;

        //find the product with the id from db
        const product = await Products.findById(id).orFail();

        //get the update data from form
        const { name, description, category, count, price, attributeTable } = req.body;


        product.name = name || product.name;
        product.description = description || product.description;
        product.category = category || product.category;
        product.count = count || product.count;
        product.price = price || product.price;
        product.attrs = attributeTable || product.attrs;

            // res.send('update product')
            await product.save()
            res.json({
                message:'Product updated'
            })
    } catch (error) {
        next(error)
    }
};

const adminFileUpload = async (req, res, next) =>{

    const { cloudinary, productId } = req.query;

    if(cloudinary === 'true'){
        try {
                const product = await Products.findById(productId).orFail();

                if(product) {
                    product.images.push({ path : req.body.url });

                    await product.save();
                }
        } catch (error) {
                next(error)
        }
        return
    }

    try {
            if(!req.files || !! req.files.images === false){
                return res.status(400).send('No files were uploaded')
            };

            const validateResult = imageValidate (req.files.images);

            if(validateResult.error){
                return res.status(400).send(validateResult.error)
            };

            const path = require('path');

            let imagesTable = [];

            const { v4: uuidv4 } = require('uuid');

            //go the the products folder in the frontend
            const uploadDirectory = path.resolve(__dirname,'../../frontend','public','images','products');

            if(Array.isArray(req.files.images)){
                imagesTable = req.files.images;
            }else{
                imagesTable.push(req.files.images)
            };

            const product = await Products.findById(req.query.productId).orFail();

              //take image extension name and save the image to the frontend
            for (const image of imagesTable) {
                const fileName=uuidv4() + path.extname(image.name);
                let uploadPath =  `${uploadDirectory}/${fileName}`;

                //save image path to the database 
                product.images.push({ path : '/images/products/'+fileName })

                //mv = move
                image.mv(uploadPath,err=>{
                    if(err) return res.status(500).send(err)
                })
            }
            
            await product.save();
            return res.send('files uploaded')
    } catch (error) {
        next(error)
    }
};

const adminDeleteProductImage = async( req, res, next)=>{
    const imagePath = decodeURIComponent(req.params.imagePath);

    if(req.query.cloudinary === 'true'){

        try {
               await Products.findOneAndUpdate({ _id : req.params.productId},
                { $pull : { images : { path: imagePath } } } ) .orFail()
                    
                    return res.end();
        } catch (error) {
                next(error)
        }
        return
    }

    try {

        const path = require('path');
        
        const finalpath = path.resolve('../frontend/public') + imagePath; 
    
       const fs = require('fs');

       fs.unlink(finalpath,err=>{
        if(err) return res.status(500).send(err)
       })

   await Products.findOneAndUpdate(
        { _id: req.params.productId },
         { $pull : { images : { path : imagePath } } 
        }).orFail();

       //if u want to respone nothing use res.end();
        return res.end();   
        
    } catch (error) {
        next(error)
    }

};

module.exports ={ getProducts, getProductById, getBestsellers, adminGetProducts, 
                               adminDeleteProduct, adminCreateProduct, adminUpdateProduct,
                               adminFileUpload, 
                               adminDeleteProductImage
                            }