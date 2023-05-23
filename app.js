const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const exhbs = require('express-handlebars');
const dbo = require('./db');
const ObjectID = dbo.ObjectID;

app.engine('hbs',exhbs.engine({layoutsDir:'views/',defaultLayout:"main",extname:"hbs"}))
app.set('view engine','hbs');
app.set('views','views');
app.use(bodyparser.urlencoded({extended:true}));

app.get('/',async (req,res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('students');
    const cursor = collection.find({})
    let students = await cursor.toArray();

    let message = '';
    let edit_id, edit_book;

    if(req.query.edit_id){
        edit_id = req.query.edit_id;
        edit_book = await collection.findOne({_id:new ObjectID(edit_id)})
    }

    if (req.query.delete_id) {
        await collection.deleteOne({_id:new ObjectID(req.query.delete_id)})
        return res.redirect('/?status=3');
    }
    
    switch (req.query.status) {
        case '1':
            message = 'Inserted Succesfully!';
            break;

        case '2':
            message = 'Updated Succesfully!';
            break;

        case '3':
            message = 'Deleted Succesfully!';
            break;
    
        default:
            break;
    }


    res.render('main',{message,students,edit_id,edit_book})
})

app.post('/store_book',async (req,res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('students');
    //let book = { title: req.body.title, author: req.body.author  };
    let book = { studentname: req.body.studentname, date_of_birth: req.body.dateOfBirth ,fathername:req.body.fathername,mothername:req.body.mothername,email: req.body.email,phone:req.body.phone,blood:req.body.blood};
    await collection.insertOne(book);
    return res.redirect('/?status=1');
})

app.post('/update_book/:edit_id',async (req,res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('students');
    let book = { studentname: req.body.studentname, date_of_birth: req.body.dateOfBirth,fathername:req.body.fathername,mothername:req.body.mothername,email: req.body.email ,phone:req.body.phone,blood:req.body.blood };
    let edit_id = req.params.edit_id;

    
    await collection.updateOne({_id:new ObjectID(edit_id)},{$set:book});
    return res.redirect('/?status=2');
})

app.listen(8000,()=>{console.log('Listening to 8000 port');})
