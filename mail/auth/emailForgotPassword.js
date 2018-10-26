import {mailSetup} from '../../config/config';

function textHtmlBody(userObj){

    return `<h2>Bookworm reset password</h2>
    <a href="${userObj.generateResetPasswordUrl()}">reset password click here</a>`;
}


export function emailForgotPassword(userObj){

   const transport  = mailSetup();

   const mailFrom = `Bookworm <${process.env.EMAIL_FROM}>`;

    const email={
        from: mailFrom,
        to: userObj.email,
        subject: "bookworm mailer reset password",
        html:textHtmlBody(userObj)
        //text:'your email body text format'
    };

    transport.sendMail(email);
}