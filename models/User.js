const validator = require('validator')
const bcrypt = require("bcrypt")
const usersCollection = require('../db').db().collection("users")

let User = function(data){
    this.data = data
    this.errors =[]

}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username) !="string"){this.data.username = ""}
    if(typeof(this.data.email) !="string"){this.data.email = ""}
    if(typeof(this.data.password) !="string"){this.data.password = ""}


    //get rid of funny property
    this.data ={
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}
User.prototype.validate = function(){
    if(this.data.username == ""){this.errors.push("please provide a username" )}
    if(this.data.username !="" && validator.isAlphanumeric(this.data.username)){
        this.errors.push("username must only contain letters and numbers" )

    }
    if(!validator.isEmail(this.data.email)){this.errors.push("please provide a email" )}
    if(this.data.password == ""){this.errors.push("please provide a password" )}
    if(this.data.password.length > 0  && this.data.password.length < 12){this.errors.push("please provide a password" )}
    if(this.data.password.length > 50 ){this.errors.push("please provide a password" )} 
    if(this.data.username.length > 0  && this.data.username.length < 3){this.errors.push("username too short" )}
    if(this.data.username.length > 30){this.errors.push("username to long" )} 


}
    User.prototype.login = function(){
        return new Promise((resolve,reject)=>{
            this.cleanUp()
            usersCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
                if(attemptedUser && bcrypt.compareSync(this.data.password,attemptedUser.password)){
                    resolve("congrate")
         
                 }else{
                   reject("invalid username")
                 }
            }).catch(function(){
                reject("please try again")
            })
      })

    }  
    
User.prototype.register = function(){
    //step #1 validate user data
    this.cleanUp()
this.validate()
    // only if there are no error

    // saved the user data into a database
    if(this.errors.length){
        //hash user password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)
        usersCollection.insertOne(this.data)
    }

}
module.exports = User