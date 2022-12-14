const Category = require('../models/CategoryModel');

const getCategory=async (req,res,next)=>{
  try {
      const get_category =await Category.find({}).sort({name:'asc'}).orFail();

      res.status(200).json(get_category)
  } catch (error) {
      next(error)
  }
};

const newCategory =async (req,res,next)=>{
   try {
      const {category} = req.body;

      if(!category){
         res.status(400).send("Category field is required");
      }
      const checkCategory = await Category.findOne({name:category});

      if(checkCategory) {
         res.status(400).send('Category already exits')
      }else{
         const createCategory = await Category.create({name:category});

         res.status(201).send({createCategory})
      }
   } catch (error) {
         next(error)
   }
};

const deleteCategory =async(req,res,next)=>{
   try {
      const {category} = req.params;

      if(category !== "Choose Category"){

               const category_In_db = await Category.findOne({name:decodeURIComponent(category)}).orFail();
         
               await category_In_db.remove();
               res.json({categoryDeleted:true});
      }else{

         res.send(`${category} not found in the database`)
      }
   } catch (error) {
         next(error)
   }
};

const saveAttr = async (req,res,next)=>{
   const { key, value, categoryChoosen } = req.body;

   if(!key || !value || !categoryChoosen){
     return res.status(400).send("All fields are required!!")
   }
   try {
      const category = categoryChoosen.split('/')[0];
      const checkCategory =await Category.findOne({name:category}).orFail();
           
      if(checkCategory.attrs.length > 0){
         //if key exit in the database then add a value to the key
         let keyDoesNotExitInDatabase = true;

         //compare the req key with the database's key
         checkCategory.attrs.map((item,ind)=>{
            if(item.key === key){
               keyDoesNotExitInDatabase = false;

               var copyAttributesValues = [...checkCategory.attrs[ind].value];

               copyAttributesValues.push(value);

              const newAttributesValue = [...new Set(copyAttributesValues) ]//give us a unique value only

               //save to the database with the new data
               checkCategory.attrs[ind].value = newAttributesValue
            }
         });
         
         if(keyDoesNotExitInDatabase){
               checkCategory.attr.push({key,value:[value]})
         };

      }else{ 
            checkCategory.attrs.push({key,value:[value]});
      }
      await checkCategory.save();
      let cate =await Category.find().sort({name:'asc'});
     return  res.status(201).json({categoryUpdated:cate})

   } catch (error) {
      next(error)
   }
}

module.exports = {getCategory,newCategory,deleteCategory,saveAttr}
