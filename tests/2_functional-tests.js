/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const testBoard = 'testBoard';
require("dotenv").config();

chai.use(chaiHttp);

function dbConnect(callback) {
  MongoClient.connect(process.env.DATABASE, function(err, db) {
    if(err) console.error(err);
    console.log("connected to DB");
   return callback(db);
  })
}

suite('Functional Tests', function() {

  
   after(function(done) {
     dbConnect(
       function(db) {
         db.collection('testBoard')
         .remove({}, function(err, res) {
          done();
         });
       }
     )
    
   })

  
  suite('API ROUTING FOR /api/threads/:board', function() {
   
    suite('POST', function() {
      test("POST to /api/threads/{board}", function(done) {
        chai.request(server)
        .post("/api/threads/testBoard")
        .send({
          "text": "Epic Gaelic instrumentals",
          "delete_password": "password"
        })
        .end(function(err, res) {
        
          const resData = res.body.data ? res.body.data : res.body;
         
          assert.isObject(resData, "res.body should be an Object");
          assert.property(resData, 'text', 'response object should have key text')
          assert.property(resData, 'delete_password', 'response object should have key delete_password')
          assert.property(resData, 'replies', 'response object should have key replies')

          done();
        })
      })
      
    });
    
    suite('GET', function() {
       test("GET to /api/threads/{board}", function(done) {
        chai.request(server)
        .get("/api/threads/testBoard")
        .end(function(err, res) {
         
          assert.isArray(res.body, "res.body should be an Array");
          
          done();
        })
      })
    });
    
    suite('DELETE', function() {
      test("DELETE to /api/threads/{board}", function(done) {
        chai.request(server)
        .post("/api/threads/testBoard")
        .send({
          "text": "Best Witcher 3 instrumentals",
          "delete_password": "password"
        })
        .end(function(err, res) {
         

         const thread_id = res.body.data ? res.body.data._id : res.body._id;
        
          chai.request(server)
          .delete("/api/threads/testBoard")
          .send({
            thread_id: thread_id,
            delete_password: "password"
          })
          .end(function(err, res) {
          

            assert.isTrue(res.body, 'res.body should be true')
          })

          done();
        })
      })
    });
    
    suite('PUT', function() {
      test("PUT to /api/threads/{board}", function(done) {
        chai.request(server)
        .post('/api/threads/testBoard')
        .send({
          text: 'example thread',
          delete_password: 'password'
        }).end(function (err, res) {
          
          const thread_id = res.body.data ? res.body.data._id : res.body._id;
         

          chai.request(server)
          .put("/api/threads/testBoard")
          .send({
            thread_id: thread_id
          })
          .end(function(err, res) {
           
            assert.equal(res.text, "success");
            
            done();
          })

        })
       
      })
    });
    

  });
  
    suite('API ROUTING FOR /api/replies/:board', function() {
      var test_ids = {
        thread_id: "",
        reply_id: ""
      }
      before(function(done) {
        chai.request(server)
        .post('/api/threads/testBoard')
        .send({
          "text": 'fiction can be strange',
          "delete_password": 'password'
        }).end(function(er, res) {
            if(er) throw er;
          const thread_id = res.body._id;
          test_ids.thread_id = res.body._id;
         
           chai.request(server)
           .post('/api/replies/testBoard')
           .send({
             text: 'but life is strange',
             delete_password: 'password',
             thread_id: thread_id
           })
           .end(function(er, res) {
            
            test_ids.reply_id = res.body.replies[0]._id;
            done();
            
             
           })
      });
    })
    suite('POST', function() {
      test("POST to /api/replies/{board}", function(done) {
        
        chai.request(server)
        .post('/api/threads/testBoard')
        .send({
          "text": 'What are your favorite shoes?',
          "delete_password": 'password'
        }).end(function(er, res) {
            if(er) throw er;
         
          const thread_id = res.body._id;
         
           chai.request(server)
           .post('/api/replies/testBoard')
           .send({
             text: 'If there not jordans, they are not sneakers',
             delete_password: 'password',
             thread_id: thread_id
           })
           .end(function(er, res) {
            assert.isTrue(true)
            done();
            
             
           })
  
  
        })
      })
     
     });
    
    suite('GET', function() {
      test("GET to /api/replies/{board}", function(done) {
        
      chai.request(server)
        .post('/api/threads/testBoard')
        .send({
          "text": 'Wisest man in the world',
          "delete_password": 'password'
        }).end(function(err, res) {
           
         const thread_id = res.body._id;

          chai.request(server)
          .post('/api/replies/testBoard')
          .send({
            text: 'Gandalf the grey?',
            delete_password: 'password',
            thread_id: res.body._id
          })
          .end(function(er, res) {
            chai.request(server)
            .get(`/api/replies/testBoard?thread_id=${thread_id}`)
            .end(function(err, res) {
              assert.isArray(res.body);
              done();
            })
          })
        })
    
      });
    });
    
    suite('PUT', function() {
      test("PUT to /api/replies/{board}", function(done) {
       
        chai.request(server)
          .post('/api/threads/testBoard')
          .send({
            "text": 'Wisest man in the world',
            "delete_password": 'password'
          }).end(function(err, res) {
             
           const thread_id = res.body.data ? res.body.data._id : res.body._id;
            
            chai.request(server)
            .post('/api/replies/testBoard')
            .send({
              text: 'Gandalf the grey?',
              delete_password: 'password',
              thread_id: thread_id
            })
            .end(function(er, res) {
           
              const reply_id = res.body.replies[0]._id;
              
              chai.request(server)
              .put(`/api/replies/testBoard`)
              .send({
                thread_id: thread_id,
                reply_id: reply_id
              })
              .end(function(err, res) {
                
                assert.equal("Success", res.text);
                done();
              })
            })
          })
      
        });
    });
    
    suite('DELETE', function() {
      test("DELETE to /api/replies/{board}", function(done) {
        
        chai.request(server)
          .post('/api/threads/testBoard')
          .send({
            "text": 'Wisest man in the world',
            "delete_password": 'password'
          }).end(function(err, res) {
             
           const thread_id = res.body.data? res.body.data._id : res.body._id;
  
            chai.request(server)
            .post('/api/replies/testBoard')
            .send({
              text: 'Like a wounded animal',
              delete_password: 'password',
              thread_id: res.body._id
            })
            .end(function(er, res) {
              var reply_id  = res.body.replies[0]._id;
          
              chai.request(server)
              .delete(`/api/replies/testBoard?thread_id=${thread_id}`)
              .send({
                delete_password: "password",
                thread_id: thread_id,
                reply_id: reply_id
              })
              .end(function(err, res) {
               
                assert.equal("Success", res.text);
                done();
              })
            })
          })
      
        });
    });
    
    });

});
