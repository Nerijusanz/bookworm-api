import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uniqueValidator from 'mongoose-unique-validator';

//TODO: email validations to email fields 
const schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        index:true
    },
    passwordHash:{ type:String,required:true},
    confirmed:{type:Boolean,default:false}
},{timestamps:true});


schema.methods.isValidPassword = function isValidPassword(inputPassword){
    return bcrypt.compareSync(inputPassword,this.passwordHash); //return boolean
};

schema.methods.setPassword = function setPassword(inputPassword){
    this.passwordHash = bcrypt.hashSync(inputPassword,10);
}


schema.methods.generateJWT = function generateJWT(){

    return jwt.sign({
        email:this.email,
    },
    process.env.JWT_SECRET
    )

};


schema.methods.toAuthJSON = function toAuthJSON(){
    return{
        email:this.email,
        confirmed:this.confirmed,
        token:this.generateJWT()
    }
};

schema.plugin(uniqueValidator,{message:'email is already taken'});



export default mongoose.model('User',schema);