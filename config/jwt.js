const jwt = require('jsonwebtoken'),
  mongoose = require('mongoose'),
  expiryDate = 86400,
  secret = process.env.JWTSECRET,
  User = mongoose.model('User'),
  avatars = require('../app/controllers/avatars').all();

module.exports = {
  /**
 * Gets user data on logging in and returns a signed token on success.
 * @function SignInJwt
 * @param {object} req  -(request) email, password
 * @param {object} res -(response) status, JSON
 * @returns {message,signed Jwt}
 */

  SignInWithJwt: (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(401).json({ message: 'Enter all required field' });
    }
    // find the user
    User.findOne(
      {
        email: req.body.email
      },
      (error, existingUser) => {
        if (error) {
          return res.status(401).json({
            message: 'An Error Occured'
          });
        }
        if (!existingUser) {
          return res.status(401).json({
            message: 'Not an existing user'
          });
        } else if (existingUser) {
          if (!existingUser.authenticate(req.body.password)) {
            return res.status(401).json({
              message: 'Invalid Password'
            });
          }
        }
        // Create the token
        req.logIn(existingUser, () => {
          const token = jwt.sign(existingUser, secret, {
            expiresIn: expiryDate
          });
          // return the token as JSON
          return res.status(200).json({ message: 'Signed in', token });
        });
      }
    );
  },

  /**
 * Gets user data on signup and assigns the user a JWT on successful signUp
 * @function SignUpJwt
 * @param {object} req -(request)name, email, password
 * @param {object} res -(response) status, JSON
 * @returns {message, signed Jwt}
 */

  SignUpWithJwt: (req, res) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(401).json({
        message: 'Email is not rightly formatted'
      });
    }
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(401).json({ message: 'Incomplete user details' });
    }

    User.findOne(
      {
        email: req.body.email
      },
      (err, existingUser) => {
        if (err) {
          return res.status(401).json({
            message: 'An Error Occured'
          });
        }
        if (!existingUser) {
          const user = new User(req.body);
          user.avatar = avatars[user.avatar];
          user.provider = 'jwt';

          user.save((err) => {
            if (err) {
              return res.status(401).json({
                message: 'Unable to save'
              });
            }

            req.logIn(user, (err) => {
              if (err) {
                return res.status(401).json({
                  message: 'Error Occured while logging in'
                });
              }
              const token = jwt.sign(user, secret, {
                expiresIn: 86400
              });
              return res.status(200).json({ message: 'Signed up', token });
            });
          });
        } else {
          return res.status(401).json({
            message: 'Existing user cannot sign up again. Please sign in'
          });
        }
      }
    );
  }
};
