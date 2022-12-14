const ObjectId = require("mongodb").ObjectId;

const orders = Array.from({length:22}).map((_,idx)=>{
    var hour =0;
    let day = 20;
    if(idx < 10){
        var hour=`0${idx}`;
        var subTotal =100;
    }else if(idx > 16 && idx < 22){
        var hour=  idx;
        var subTotal =100 + 12*idx
    }else{
        var hour= idx;
        var subTotal= 100;
    };

    return {
        user:ObjectId("637381ef9483630d4d9dbf15"),
        orderTotal:{
            itemCounts:5,
            cartSubTotal:subTotal,       
         },
         cartItems:[
            {
            name:"Product Name",
            price:34,
            image:{path:'/images/watches.jpg'},
            quantity:3, //order quantity
            count:12, // stock
         }
        ],
        paymentMethod:'Paypal',
        isPaid:false,
        isDelivered:false, 
        createdAt:`2022-11-${day}T${hour}:46:40.650+00:00`
    }
});

module.exports = orders;