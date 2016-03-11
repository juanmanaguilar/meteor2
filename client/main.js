    Meteor.subscribe("documents");
    Meteor.subscribe("editingUsers");
    
    Template.navbar.helpers({
       documents: function(){
           return Documents.find();
       }, 
    });
    
    Template.docMeta.helpers({
       document: function(){
           return Documents.findOne({_id: Session.get("docid")});
       },
       
       canEdit: function(){
           var doc = Documents.findOne({_id: Session.get("docid")});
           if (doc){
               if (doc.owner == Meteor.userId()) {
                   return true;
               }
           }
           return false;    
        }
    });
    
    Template.editableText.helpers({
       userCanEdit : function(doc, Collection) {
           doc = Documents.findOne({_id: Session.get("docid"), owner: Meteor.userId()});
           if (doc){ return true; }
           else { return false; }
       } 
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
    
    Template.docMeta.events({
        "click .js-tog-private": function(event){
            console.log(event.target.checked);
            var doc = {_id: Session.get("docid"), isPrivate: event.target.checked};
            Meteor.call("updateDocPrivacy", doc);
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