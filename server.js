let express = require("express")
let bodyparser = require("body-parser")
let app = express()
let fetch = require("axios")
let url  = require("./auth.js")
let mysql = require("mysql2")
let fs = require("fs")
let cookie = require("cookie-parser")
let pdfgenmd = require("./pdfgen.js")
let cors = require("cors")
app.use(bodyparser.json())
app.use(cors())
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static(__dirname+"/public"))
app.use(cookie())
app.get("/dash",(req,res)=>{
	

	
})

app.get("/",(req,res)=>{
 let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
  if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
      res.sendFile(__dirname+"/public/index.html")
    }
  })
}else{
   res.redirect("/login")
}
})
app.get("/ind",(req,res)=>{
  let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
  if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
      res.sendFile(__dirname+"/public/index.html")
    }
  })
}else{
   res.redirect("/login")
}
	
})
app.get("/payment",(req,res)=>{
  let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
  if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
      res.sendFile(__dirname+"/public/payment.html")
    }

  })
}else{
   res.redirect("/login")
}
	
})
app.post("/storepaymenturl",(req,res)=>{
	console.log(req.body)
	let sqlConnection = new mysql.createConnection({
		user:"root",
		password:"Lakshmi@87",
		database:"jacsi",
		host:"localhost"

	})
if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }
  })
}


    let myparams =new URLSearchParams()
    myparams.set("allow_repeated_payments",true)
    myparams.set("amount",parseInt(req.body.amount))
    myparams.set("purpose",req.body.purporse)
  //  myparams.set("buyer_name",req.body.buyer_name)
    myparams.set("send_email",false)
    myparams.set("send_sms",false)
    myparams.set("redirect_url","http://jacsi.click/saveendpoint?id="+req.cookies.user_id)
    url(req.cookies.user_id).then((e)=>{
    	console.log("95",e)

const options = {
  method: 'POST',
  url: 'https://api.instamojo.com/v2/payment_requests/',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer '+e.data.access_token,
    'content-type': 'application/x-www-form-urlencoded'
  },
  data: myparams,
};

fetch
  .request(options)
  .then(function (response) {
    sqlConnection.query("select id,paymentDetails from paymentData where id="+req.cookies.user_id,function(error1,result1)
    {
     console.log("113",error1,result1)
      if(result1.length==0){
     sqlConnection.query("insert into paymentData values("+req.cookies.user_id+",'"+JSON.stringify([response.data])+"')",function(error2,result2){
       if(!error2){       
            res.end("Saved sucessfully") 
}

else{ 
   res.status(403)
res.end("Failed to save ")
}
    })
   }
     else{
      let data = JSON.parse(result1[0].paymentDetails)
      data.push(response.data)
        sqlConnection.query("update  paymentData set paymentDetails='"+JSON.stringify(data)+"' where id="+req.cookies.user_id,function(error3,result3){
          if(!error3){
            res.end("Saved sucessfully")
}else{
   res.status(403)
res.end("Failed to save ")
}
        })
}
        console.log()
     
    
    })
    

  })
  .catch(function (error) {
    console.error(error);
  });
   
})
})
app.post("/updaterequest",(req,res)=>{
	console.log(req.body)
})
app.post("/listpayments",(req,res)=>{
  let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
   
 if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }
  })
}
  sqlConnection.query("select paymentDetails from paymentData where id="+req.cookies.user_id ,(error,result)=>{
   console.log(error,result)
   if(result.length>0){
    res.end(JSON.stringify({user_id:req.cookies.user_id,data:JSON.parse(result[0].paymentDetails)}))
 }else{
  res.end(JSON.stringify({error:"No paymnets found"}))
 }
  })
})
app.get("/login",(req,res)=>{
	res.redirect("/login.html")
})
app.post("/loginvalidate",(req,res)=>{
       console.log(req.body)
       let conn =  mysql.createConnection({
              host:"localhost",
              user:"root",
              password:"Lakshmi@87",
              database:"jacsi"

       })
           
      conn.query("select id from customers where email='"+req.body.username+"' and  password='"+req.body.password+"'",function(err,result){
      if(result.length>0){
         res.cookie("user_id",result[0].id,{
          httpOnly:true,
          expires:new Date((new Date()).getTime()+(2*60*60*24*1000)),
          sameSite:"strict"
         })
         res.status(200)
         res.end(JSON.stringify({status:"ok"}))

        }else{
        res.end(JSON.stringify({status:"Invalid Login details"}))
      }
      })

       
      
})
app.get("/getPayments",(req,res)=>{
  
    let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }
  })
}
 sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
      if(err){
            res.redirect("/login")
    }
    })

    
    sqlConnection.query("select paymentDetails from paymentData where id="+req.cookies.user_id,function(error1,result1){
      res.end(JSON.stringify(result1))
    })
 
})
app.get("/saveendpoint",(req,res)=>{
   let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
   console.log("238",url)
   url(parseInt(req.query["id"]),"1").then((e)=>{
    fetch.request({
      method:"GET",
      url:"https://api.instamojo.com/v2/payments/"+req.query["payment_id"],
      headers:{"Authorization":"Bearer "+e.data.access_token,"accepts":"application/json",
      "content-type":"application/x-www-form-urlencoded"
    }

    }).then((e2)=>{
      console.log(e2.data.phone)
    fetch.request({
      url:"https://www.fast2sms.com/dev/bulkV2",
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"xZWN7D6ht8Gje90JKoykvsfRMUBP3bSXLriFEaITqpYlQA2OmVCaYhRO1iUpJmsE3rK6TSB4P509FGNW"},
      data:JSON.stringify({route:"q",numbers:e2.data.phone,message:"Dear customer payment for RS:"+e2.data.amount+" has been processed sucessfully with the Transcation number "+e2.data.id+" Thanks for using Payment system developed  by P.ARUN and M.Gowtham "})
      
    }).then((e)=>{console.log("286",e)}).catch((error)=>console.log(error))


  sqlConnection.query("select paymentDetails from paymentData where id="+req.query["id"],(error,result)=>{
   console.log(error,result)
   if(!error){
    let arr = JSON.parse(result[0].paymentDetails)
       arr.forEach((value,index)=>{
      if(value.id==req.query["payment_request_id"]){
         arr[index].payments.push(e2.data)
         console.log(e2)
         sqlConnection.query("update paymentData set paymentDetails='"+JSON.stringify(arr)+"' where id="+req.query["id"],(error2,result2)=>{
  
    fetch.request({
      url:"http://jacsi.click/invoicegenerator",
      method:"POST",
      headers:{"content-type":"application/json"},
      data:JSON.stringify({user_id:req.query["id"],fields:e2.data})
    }).then((e3)=>{
      sqlConnection.query("select companyname from customers where id="+req.query["id"],function(error3,result3){
        console.log(159,result3[0])
          pdfgenmd.pdfgen(result3[0].companyname,e2.data,res).then((e)=>{
            //res.sendFile(__dirname+"/INVOICE2.pdf")
            
          }).then((e)=>{
              // fs.unlink(__dirname+"/INVOICE2.pdf",function(errs,ress){
              //   console.log(errs,ress)
              // })
          })

      })
          
    })
                // res.end("Your order has been processed sucessfully ")
         })
      }
    })
  
   }
  })

    })
   }).catch(()=>{})


 })
app.get("/getpaymentsDashboard",(req,res)=>{

  let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
if(Object.keys(req.cookies).includes("user_id")){
 sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
  res.sendFile(__dirname+"/public/paymentlist.html")
    }
  })
}else{
  res.redirect("/login")
}

  
})
app.get("/register",(req,res)=>{
 
if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
  res.redirect("/register.html")
    }
  })
}else{
  res.redirect("/login")
}

})
app.get("/invoice",(req,res)=>{
 let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
 if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
      res.redirect("/invoice.html")
    }
  })
}else{
   res.redirect("/login")
}
 
})
app.post("/invoicegenerator",(req,res)=>{

  let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
    console.log("372",Object.keys(req.body).includes("fields")?req.body.fields["user_id"]:req.body["paymentid"])
   url(req.body.user_id||req.cookies.user_id).then((e)=>{
   try{
  
    fetch.get("https://api.instamojo.com/v2/payments/"+(Object.keys(req.body).includes("fields")?req.body.fields["id"]:req.body["paymentid"]),{
      headers:{"Authorization":"Bearer "+e.data.access_token,"accepts":"application/json",
      "content-type":"application/x-www-form-urlencoded"
    }
     
    }).then((e2)=>{
      
      if(e2.data){
        sqlConnection.query("select companyname from customers where id="+(req.body.user_id||req.cookies.user_id),function(error1,result1){
            
            if(!error1){
          pdfgenmd.pdfgen(result1[0].companyname,e2.data,res,req.body.user_id).then((e)=>{
           // res.sendFile(__dirname+"/INVOICE2.pdf")
          })
        }else{
          res.end("Record not found")
        }
        })
      }else{
       res.end("Record not found") 
      }
           
            }).catch((e)=>{
          res.end("Record not found")
})

  }catch(e){
    res.end("Record not found")
  }

  })
  })
app.get("/turnover",(req,res)=>{
  let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })

  if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",err)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
        
  console.log("425")
       res.sendFile(__dirname+"/public/page2.html")
    
    }
  })
}else{
   res.redirect("/login")
}
 
})
app.get("/turnoverdeliver",(req,res)=>{
 let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
console.log(req.cookies.user_id)
  sqlConnection.query("select paymentDetails from paymentData where id="+req.cookies.user_id,function(err,result){
       console.log(err)
       if(result.length>0){
       res.end(result[0].paymentDetails)
       }else{
         res.end(JSON.stringify({error:"No payment"}))
       }
  })
 
})
app.get("/paymentListener",(req,res)=>{
   let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
  if(req.query["user_id"]){
      sqlConnection.query("select paymentDetails from paymentData where id="+req.query['user_id'],function (err,result) {
        if(result.length>0){
          let temp = JSON.parse(result[0].paymentDetails)
         let data= temp.filter((value,index)=>{
         
            if(value.id==req.query["paymentid"]){
              return value.longurl
            }
          })
       if(data[0].longurl){
        res.end(JSON.stringify({url:data[0].longurl}))
       }else{
        res.end(JSON.stringify({url:"No records found"}))
       }
        }
      })
       
  }
})
app.get("/thirdpayment",(req,res)=>{
  res.sendFile(__dirname+"/public/handlepayment.html")
})
app.get("/payout",(req,res)=>{
   let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
if(Object.keys(req.cookies).includes("user_id")){
  sqlConnection.query("select id from customers where id="+req.cookies.user_id,function(err,result){
    console.log("26",result)
    if(result.length==0){
      console.log("worked")
       res.redirect("/login")
    }else{
        
  console.log("425")
      res.sendFile(__dirname+"/public/payout.html")
    
    }
  })
}else{
   res.redirect("/login")
}
  
})
app.get("/payoutdetails",(req,res)=>{
     let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
     sqlConnection.query("select account_number,ifsc from customers where id="+req.cookies.user_id,function(err,result){
          res.end(JSON.stringify(result))
     })
})
app.post("/getpaymentDetailsApi",(req,res)=>{
   let sqlConnection = new mysql.createConnection({
    user:"root",
    password:"Lakshmi@87",
    database:"jacsi",
    host:"localhost"

  })
console.log(req.body)
   sqlConnection.query("select id from customers where client_id='"+req.body.client_id+"' and client_secret='"+req.body.client_secret+"'",function(error,result2){
   console.log(result2)
    if(result2.length>0){
      sqlConnection.query("select paymentDetails from paymentData where id="+result2[0].id,function(error4,result3){
          console.log(result3)
        res.end(JSON.stringify(result3[0]))
      })
     
    }else{
      res.end(JSON.stringify({error:"No record found"}))
    }
   })

})
app.listen(80,()=>{
	console.log("lisitening port 300")
})
