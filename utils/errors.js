// ------------CUSTOM RESPONSE ERROR RETURN TO FRONTEND--------------

export const responseErrorGlobal = (res,errorsArrayList) => {

    res.status(400)
       .json({errors:{
                global:errorsArrayList
            }}).end();
   
}


export const responseErrorEmail = (res,errorStringMsg) => {

    res.status(400)
       .json({errors:{
                email:errorStringMsg
            }}).end();
   
}

// -------------------------------------------------------------


/*
export const parseErrors = (errors) =>{

    // make import library on top page;
    import _ from 'lodash';

    const result = {};

    _.forEach(errors,(val,key)=>{
        result[key] = val.message;
    })

    return result;

}
*/