import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//TODO: email validations to email fields 
const schema = new mongoose.Schema({
    email:{type:String,required:true,lowercase:true,unique:true,index:true},
    passwordHash:{ type:String,required:true}
},{timestamps:true});


schema.methods.isValidPassword = function isValidPassword(inputPassword){
    return bcrypt.compareSync(inputPassword,this.passwordHash); //return boolean
};


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
        token:this.generateJWT()
    }
};

export default mongoose.model('User',schema);