this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {
    
    Template.editor.helpers({
        docid: function(){
            var doc = Documents.findOne();
            if (doc){
                return doc._id;
            }
            else {
                return undefined;
            }
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