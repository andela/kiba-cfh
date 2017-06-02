const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

exports.gameInvite = (req, res) => {
  const gameUrl = req.body.link;
  const fromEmail = new helper.Email('game-invite@kibacfh.com');
  const toEmail = new helper.Email(req.body.email);
  const subject = 'Welcome to Kiba';
  const sender = req.body.gameOwner;
  const invitee = req.body.name;
  const content = new helper.Content(
    'text/plain',
    `Hello ${invitee}, Welcome to CARDS for HUMANITY,
    You have been invited by ${sender} to play a game.
    Follow this link to get started ${gameUrl}`
  );
  const mail = new helper.Mail(fromEmail, subject, toEmail, content);

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, (error, response) => {
    if (error) {
      return res.send(error);
    }
    return res.send(response.body);
  });
};
