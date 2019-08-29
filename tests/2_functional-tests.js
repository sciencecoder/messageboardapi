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

  suite('API ROUTING FOR /api/threads/:board', function() {
    before(function(done) {
      chai.request(server)
        .post("/api/threads/board1")
        .send({
          "text": "Example thread",
          "delete_password": "secret"
        })
        .end(function(err, res) {
          console.log("Setup data", res.body);
          //assert.isArray(res.body, "res.body should be an Array");
         
          done();
        })
    })
    suite('POST', function() {
      test("POST to /api/threads/{board}", function(done) {
        chai.request(server)
        .get("/api/threads/board1")
        .end(function(err, res) {
          //console.log(res.body);
          assert.isArray(res.body, "res.body should be an Array");

          done();
        })
      })
      
    });
    
    // suite('GET', function() {
    //    test("POST to /api/threads/{board}", function(done) {
    //     chai.request(server)
    //     .get("/api/threads/board1")
    //     .end(function(err, res) {
    //       console.log(res.body);
    //       assert.isArray(res.body, "res.body should be an Array");
          
    //       done();
    //     })
    //   })
    // });
    
    // suite('DELETE', function() {
    //   test("POST to /api/threads/{board}", function(done) {
    //     chai.request(server)
    //     .get("/api/threads/board1")
    //     .end(function(err, res) {
    //       console.log(res.body);
    //       assert.isArray(res.body, "res.body should be an Array");
          
    //       done();
    //     })
    //   })
    // });
    
    // suite('PUT', function() {
    //   test("POST to /api/threads/{board}", function(done) {
    //     chai.request(server)
    //     .get("/api/threads/board1")
    //     .end(function(err, res) {
    //       console.log(res.body);
    //       assert.isArray(res.body, "res.body should be an Array");
          
    //       done();
    //     })
    //   })
    // });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
