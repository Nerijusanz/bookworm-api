import {mailSetup} from '../../config/config';

function textHtmlBody(userObj){

    return `<h2>Bookworm user account confirmation </h2>
    <a href="${userObj.generateSignupConfirmationUrl()}">click here to to confirm account</a>`;
}

/*function textBody(userObj){

    return `Welcome to Bookworm. Please, confirm your email.
    ${userObj.generateConfirmationUrl()}`;
}*/



export function emailSignupConfirmation(userObj){

   const transport  = mailSetup();

   const mailFrom = `Bookworm <${process.env.EMAIL_FROM}>`;

    const email={
        from: mailFrom,
        to: userObj.email,
        subject: "bookworm mailer",
        //text: textBody(userObj)
        html:textHtmlBody(userObj)
    };

    transport.sendMail(email);
}

