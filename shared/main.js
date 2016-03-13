Meteor.methods({
    addDoc: function(){
        var doc;
        if (!this.userId){
            return;
        }
        else {
            console.log("this.userId: "+this.userId);
//            console.log("this.user()._id: "+this.user()._id);
            console.log("Meteor.userId: "+Meteor.userId);
            console.log("Meteor.user()._id: "+Meteor.user()._id);
            doc = {owner: this.userId, createdOn: new Date(), title: "My new doc"};
            var id = Documents.insert(doc);
            console.log("addDoc method got an id: "+id);
            return id;
        }
    },
    updateDocPrivacy: function(doc){
        console.log("updateDocPrivacy method");
        console.log(doc);
        var realDoc = Documents.findOne({_id: doc._id, owner: this.userId});
        if (realDoc) {
            realDoc.isPrivate = doc.isPrivate;
            Documents.update({_id: doc._id}, realDoc);
        }
    },
    addEditingUser: function(docid){
        var doc, user, eusers;
        doc = Documents.findOne({_id: docid});
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
    },
    addComment: function(comment){
        console.log("addComment method running!")
        if(this.userId){
            comment.createdOn = new Date();
            comment.userId = this.userId;
            return Comments.insert(comment);
        }
        return;
    }
})