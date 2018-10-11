import {mailSetup} from '../../config/config';

function textHtmlBody(userObj){

    return `<h2>Bookworm your account password successfully changed.</h2>
    <a href="${process.env.FRONTEND_HOST}/login">login your account</a>`;
}


export function emailResetPasswordConfirm(userObj){

   const transport  = mailSetup();

   const mailFrom = `Bookworm <${process.env.EMAIL_FROM}>`;


    const email={
        from: mailFrom,
        to: userObj.email,
        subject: "bookworm mailer password changed",
        html:textHtmlBody(userObj)
        //text:'resetPassword'
    };

    transport.sendMail(email);
}