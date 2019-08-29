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
    console.log("connected to DB");
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
        
        res.status(400).send({error: "Thread already exists", data: doc});
        
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
  .delete(function(req, res) {
   //I  hate being callbacked so many times!
    if(req.body.thread_id && req.body.thread_id.length == 24 && req.body.delete_password) {
      dbConnect((db) => {
        var cllctn = db.collection(req.params.board);
        cllctn.findOne({_id: new ObjectId(req.body.thread_id)},
        {fields: {
          delete_password: 1,
          _id: 1
        }},
        function(err, doc) {
          if(err || !doc) {
            console.error(err);
            res.status(500)
            .send({error: `Could not find  thread with _id ${req.body.thread_id}`})
          }
          else if(doc) {
            bCrypt.compare(req.body.delete_password, doc.delete_password, 
            function(err, authenticated) {
              if (err || !authenticated) {
                console.error(err);
                res.status(500).send("Incorrect password")
              }
              else if(authenticated) {
                 cllctn.remove({_id: ObjectId(req.body.thread_id)}, 
                 function(err, rDocs) {
                if(err || rDocs < 1) {
                 console.error(err);
                 res.status(500).send({error: "Could not remove selected thread"})
              } else {
               res.send("Success")
             }
            });
              } 
            })
           
        
          }
        })
        
      })
    }
    else {
      res.status(400)
      .send({error: "Must include thread_id  and delete_password in request body"})
    }
  })
  .put(function(req, res) {
    if(req.body.thread_id) {
      dbConnect((db) => {
        db.collection(req.params.board)
        .update({_id: ObjectId(req.body.thread_id)}, {$set: {reported: true}}, function(err, updateResult) {
          if(err) {
            console.error(err) 
          }
          res.send("Success");
          db.close();
        })
      })
    }
    else {
      res.status(400).send("Must provide thread_id in search query")
    }
  });
  
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
        cllctn.update({_id: ObjectId(req.body.thread_id)}, 
        {$push: {replies: replyData}, $set: {bumped_on: getStringDate()}}, {},
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
  })
  .delete(function(req, res) {
    var board = req.params.board;
    if(req.body.thread_id && req.body.reply_id && req.body.delete_password) {
      dbConnect((db) => {
        var cllctn = db.collection(board);
        cllctn.findOne({_id: ObjectId(req.body.thread_id)},
        { 
          fields: {
          replies: {$elemMatch:{ _id: ObjectId(req.body.reply_id)}}
          }
          
        },
        function(err, doc) {
          if(err || !doc) {
            console.error(err);
            res.send("Could not find thread with provided thread_id")
          }
          else  {
            bCrypt.compare(req.body.delete_password, doc.replies[0].delete_password, function(err, isAuth) {
              if(err || !isAuth) {
                console.error(err);
                res.status(400).send("Incorrect password");
              }
              if(isAuth) {
                //Having trouble getting thread reply from replies array with correct _id and updating it
                
                cllctn.update({
                  _id: ObjectId(req.body.thread_id),
                  "replies._id": ObjectId(req.body.reply_id)
                  
                },
                {
                  $set: {
                    "replies.$.text": "[deleted]"}
                  
                }, 
                { w: 2},
                function(err, uRes) {
                  if (err) {
                    console.error(err);
                    res.status(500).send("Could not delete reply")
                  }
                  res.send("Sucess")
                 
                })
              }
              })
            
            
          }
        })
      })
    }
    
    else {
      res.send("missing some fields");
    }
  })
  .put(function(req, res) {

    if(req.body.thread_id && req.body.reply_id && req.body.thread_id.length == 24 && req.body.reply_id.length==24) {
      dbConnect((db) => {
        db.collection(req.params.board)
        .update({_id: ObjectId(req.body.thread_id), "replies._id": ObjectId(req.body.reply_id)},
         {$set: {"replies.$.reported": true}}, function(err, updateResult) {
           if(err) {
             res.send("error")
           } else {
            res.send("Success");

           }
        })
      })
    }
  });
};

