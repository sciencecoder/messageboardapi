/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bCrypt = require("bcrypt");
require("dotenv").config();
function dbConnect(callback) {
  MongoClient.connect(process.env.DATABASE, function(err, db) {
    if(err) console.error(err);
    console.log("connected to DB")
   return callback(db);
  })
}

function getStringDate() {
    var today = new Date();
    var dd = ("0"+today.getDate().toString()).slice(-2);
    var mm = ("0"+(today.getMonth() + 1).toString()).slice(-2); //January is 0!
    var yyyy = today.getFullYear();
    var hours = ("0" + today.getHours().toString()).slice(-2);
    var minutes = ("0" + today.getMinutes().toString()).slice(-2);
    var seconds = ("0" + today.getSeconds().toString()).slice(-2);
    today =  yyyy + '-' + mm + '-' + dd + "T" + hours + ":" + minutes + ":" + seconds;
  return today;
}
 

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post(function(req, res) {
    //if all fields in req.body
    if(req.body.text && req.body.delete_password) {
    var board = req.params.board;
    
    var currTime = getStringDate();
    
    var threadObject = {
      text:req.body.text,
      created_on: currTime,
      bumped_on: currTime,
      reported: false,
      replies: []
    }
    
    dbConnect((db) => {
      
      
      
     var cllctn = db.collection(board);
     
       cllctn.findOne({text: req.body.text}, function(err, doc) {
         if(err) console.error(err);
         
      if(doc) {
        
        res.status(400).send({error: "Thread already exists", thread: doc.text});
        
      } else {
        
        bCrypt.hash(req.body.delete_password, 10, function(err, hash) {
          if(err) console.error(err);
          
        threadObject.delete_password = hash;
        cllctn.insert(threadObject, function(err, docRes) {
          if(err) console.error(err);
           res.send(docRes.ops[0]);
           
        })
        db.close();
        
        })
       
      }
    })
    })
   
    } else {
      res.status(400).send({error: "Must provide text and delete_password in request body"})
    }  
    
  
  })
  .get(function(req, res) {
    var board = req.params.board;
    if(true) {
      dbConnect((db)=> {
        var cllctn = db.collection(board);
        cllctn.find({}, 
        {reported: 0, delete_password: 0, replies: { $slice: 3 }},
        {limit: 10})
        .toArray(function(err, docs) {
          if(err) console.error(err);
          
          res.send(docs);
          db.close();
        })
      })
    } else {
      
    }
  })

  app.route('/api/replies/:board')
  .post(function(req, res) {
    //if all fields in req.body
    if(req.body.text && req.body.delete_password && req.body.thread_id) {
    var created_on = getStringDate();
    var replyData = {
        _id: new ObjectId(),
        created_on,
        text: req.body.text,
        reported: false,
          
      };
    dbConnect((db) => {
      var cllctn = db.collection(req.params.board);
      
      bCrypt.hash(req.body.delete_password, 10, function(err, hash) {
        if(err) console.error(err);
        replyData.delete_password = hash;
        cllctn.update({_id: ObjectId(req.body.thread_id.slice(-24))}, {$push: {replies: replyData}}, {},
        function(err, doc) {
          if(err) {
            console.error(err);
            res.send({error: "Could not add reply to thread"})
          }
          res.send( {meesage: "Added reply to thread"});
        })
      })
    })
    } 
    else {
      res.status(400)
      .send({error: "Missing fields in request body. Must include fields: delete_password, text, thread_id"})
    }
  })
  .get(function(req, res) {
    var board = req.params.board;
    var thread_id = req.query.thread_id;
    if(thread_id) {
        dbConnect((db)=>{
      db.collection(board).find(
      {_id: new ObjectId(thread_id.slice(-24))}, 
      {fields: {
        reported: 0,
        delete_password: 0
      },
      limit: 10
      })
      .toArray(function(err, doc) {
        if(err) {
          console.error(err);
          res.status(500).send({error: "Could not get thread"})
        }
        res.send(doc);
        db.close();
      })
    })
    
    }
    else {
      res.status(500).send({error: "Must provide thread_id to get thread replies"})
    }
  });

};
