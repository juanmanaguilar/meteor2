    Meteor.startup(function () {
    // code to run on server at startup
      if (!Documents.findOne()){
          Documents.insert({title: "My new document"});
      }
    });
     
    Meteor.publish("documents", function(){
        return Documents.find({
                                $or: [ {isPrivate: {$ne: true}},
                                       {owner: this.userId}
                                    ]
                                });
    });  
    
    Meteor.publish("editingUsers", function(){
        return EditingUsers.find();
    }); 