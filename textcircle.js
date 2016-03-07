this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient) {
    
    Meteor.setInterval(function(){
        // update the current_date variable every 1000 ms
        // la metemos en sesion para que use la propiedad reactive y recargue
        // cada vez que cambie la variable
        Session.set("current_date", new Date());
    }, 1000);
    
    Template.date_display.helpers({
        current_date: function(){
            return Session.get("current_date");
        }
    });
    
    Template.editor.helpers({
        docid:function(){
            console.log("editor helper");
            console.log(Documents.findOne());
 //           return Documents.findOne()._id;
            var doc = Documents.findOne();
            if (doc){
                return doc._id;
            }
            else {
                return undefined;
            }
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
