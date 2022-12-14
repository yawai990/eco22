const imageValidate = (images)=>{

    let imageTable = [];

    if(Array.isArray(images)){
        imageTable = images;
    }else{
        imageTable.push(images)
    };

    //check the total number of the image

    if(imageTable.length > 3) return {error:'Please Send Only 3 image at once'};

    //checking the image size and image type;

    for (const image of imageTable) {
        //1048576 = 1 MB,
            if(image.size > 1048576) return {error:"Size too large (above 1 MB"}

            const fileTypes = / jpg | jpeg | png /;

            const mimetype = fileTypes.test(image.mimetype);

           if(mimetype) return {error:'Incorrect image type (should be jpg or jpeg or png)'}
    };

    return {error:false}

};

module.exports = imageValidate;
