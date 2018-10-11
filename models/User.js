import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import uniqueValidator from 'mongoose-unique-validator';


const schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,    // uniqueValidator plugin
        index:true
    },
    passwordHash:{ type:String,required:true},
    confirmed:{type:Boolean,default:false},
    signupConfirmationToken:{type:String,default:''},
    resetPasswordToken:{type:String,default:''},
},{timestamps:true});


schema.methods.setPassword = function setPassword(inputPassword){
    this.passwordHash = bcrypt.hashSync(inputPassword,10);
}

schema.methods.isValidPassword = function isValidPassword(inputPassword){
    return bcrypt.compareSync(inputPassword,this.passwordHash); //return boolean
};


// -------------confirmation token -------------------

schema.methods.setSignupConfirmationToken = function setSignupConfirmationToken(){
    this.signupConfirmationToken = this.generateJWTSignupConfirmationToken();
}

// signup confirmation email link for confirmation
schema.methods.generateSignupConfirmationUrl = function generateSignupConfirmationUrl(){
    return `${process.env.FRONTEND_HOST}/signup_confirmation_token/${this.signupConfirmationToken}`;
}

// ----------------------------------------------

// -----------reset password token
schema.methods.setResetPasswordToken = function setResetPasswordToken(){
    this.resetPasswordToken = this.generateJWTResetPasswordToken();
}

// forgot password email link for reset password
schema.methods.generateResetPasswordUrl = function generateResetPasswordUrl(){
    return `${process.env.FRONTEND_HOST}/reset_password_token/${this.resetPasswordToken}`;
   
}

// ------------------------------------------

// ---------------JWT Generators ---------------------
schema.methods.generateJWTUserToken = function generateJWTUserToken(){
   
    return jwt.sign({
        id: this._id,
        password_public:bcrypt.hashSync(this.passwordHash,10)  // take aditional bcrypt passwordHash cripting for public area
    },
     process.env.JWT_SECRET,
     {expiresIn:"86400s"}    //3600*24  //24h
    )

};



schema.methods.generateJWTSignupConfirmationToken = function generateJWTSignupConfirmationToken(){

    return jwt.sign({
        _id:this._id
    },
     process.env.JWT_SECRET,
     {expiresIn:"86400s"}    //3600*24  //24h
    )

};

schema.methods.generateJWTResetPasswordToken = function generateResetPasswordToken(){

    return jwt.sign({
        _id:this._id
    },
    process.env.JWT_SECRET,
    {expiresIn:"86400s"} //3600*24 =>24h
    )
} 


// ----------- unique email check -----------
// schema.plugin(uniqueValidator,{errors:{global:["email is already taken."]}});



export default mongoose.model('User',schema);