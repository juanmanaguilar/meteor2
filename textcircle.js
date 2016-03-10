this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {
    
    Template.navbar.helpers({
       documents: function(){
           return Documents.find({});
       }, 
    });
    
    Template.editor.helpers({
        docid: function(){
            setupCurrentDocument();
            return Session.get("docid");
        },
        config: function(){
            return function(editor) {
                editor.setOption("lineNumbers", true);
                editor.setOption("theme", "cobalt");
                // set a callback that gets triggered whenever the user
                // makes a change in the code editing window
                editor.on("change", function(cm_editor, info){
                  // send the current code over to the iframe for rendering
                  $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
                  Meteor.call("addEditingUser");
                });        
            }
        },
    });
    
    Template.editingUsers.helpers({
       users: function(){
           var doc, eusers, users;
           doc = Documents.findOne();
           if (!doc) {return;}
           eusers = EditingUsers.findOne({docid: doc._id});
           if (!eusers) {return;}
           users = new Array();
           var i = 0;
           for (var user_id in eusers.users){
               users[i] = fixObjectKeys(eusers.users[user_id]);
               i++;
           }
           return users;
       } 
    });
    
///////
// EVENTS
///////
    
    Template.navbar.events({
        "click .js-add-doc": function(event){
            event.preventDefault();
            if (!Meteor.user()){
                alert("You need to login first!");
            }
            else {
                console.log("Adding a new document");
                var id = Meteor.call("addDoc", function(err, res){
                    if (!err) {
                        console.log("callback got an id: "+res);
                        Session.set("docid", res);
                    }
                });
            }            
        },
        "click .js-load-doc": function(event){
            console.log(this);
            Session.set("docid", this._id);
        }
    })
 
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
      if (!Documents.findOne()){
          Documents.insert({title: "My new document"});
      }
  });
}

Meteor.methods({
    addDoc: function(){
        var doc;
        if (!this.userId){
            return;
        }
        else {
            doc = {owner: this.userId, createdOn: new Date(), title: "My new doc"};
            var id = Documents.insert(doc);
            console.log("addDoc method got an id: "+id);
            return id;
        }
    },
    addEditingUser: function(){
        var doc, user, eusers;
        doc = Documents.findOne();
        if (!doc){ return; } // No document 
        if (!this.userId){ return; } // No logged in user
        // I have a doc and possibly a user
        user = Meteor.user().profile;
        eusers = EditingUsers.findOne({docid: doc._id});
        if (!eusers){
            eusers = {
                docid: doc._id,
                users: {}
            };    
        }
        user.lastEdit = new Date();
        eusers.users[this.userId] = user; 
        
        EditingUsers.upsert({_id:eusers._id}, eusers);
    }
})

function setupCurrentDocument(){
    var doc;
    if (!Session.get("docid")) {
        doc = Documents.findOne();
        if (doc) {
            Session.set("docid", doc._id);
        }
    }
}

// this renames object keys by removing hyphens to make the compatible 
// with spacebars. 
function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}