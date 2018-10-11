import {mailSetup} from '../../config/config';

function textHtmlBody(){

    return `<h2>Bookworm user account confirmed successfully.</h2>
    <a href="${process.env.FRONTEND_HOST}/login">login to your account</a>`;
}


export function emailSignupUserConfirm(userObj){

   const transport  = mailSetup();

   const mailFrom = `Bookworm <${process.env.EMAIL_FROM}>`;


    const email={
        from: mailFrom,
        to: userObj.email,
        subject: "bookworm user account confirmed",
        html:textHtmlBody()
        //text:'your email body text format'
    };

    transport.sendMail(email);
}