this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");
Comments = new Mongo.Collection("comments");

Comments.attachSchema(new SimpleSchema({
    title: {
        type: "text",
        label: "Title",
        max: 200
    },
    body: {
        type: "text",
        label: "Comment",
        max:1000
    }
}));