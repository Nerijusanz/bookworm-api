import mongoose from 'mongoose';


const schema = new mongoose.Schema({

    userId:{type:mongoose.Schema.Types.ObjectId,required:true},
    goodreadsId:{type:String,required:true},
    title:{type:String,required:true},
    author:{type:String,default:''},
    cover:{type:String,default:''},
    pages:{type:String,default:''}
},{timestamps:true});

export default mongoose.model('Books',schema);