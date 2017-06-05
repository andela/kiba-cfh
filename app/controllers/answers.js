/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  async = require('async'),
  Answer = mongoose.model('Answer'),
  _ = require('underscore');
let gameRegion;
/**
 * Find answer by id
 */
exports.answer = (req, res, next, id) => {
  Answer.load(id, (err, answer) => {
    if (err) return next(err);
    if (!answer) return next(new Error(`Failed to load answer ${id}`));
    req.answer = answer;
    next();
  });
};

/**
 * Show an answer
 */
exports.show = (req, res) => {
  res.jsonp(req.answer);
};

exports.byRegion = (req, res) => {
  gameRegion = req.query.id;
  res.send('tango');
};
/**
 * List of Answers
 */
exports.all = (req, res) => {
  // const queryString = req.params.region;
  Answer.find({ official: true }).select('-_id').exec((err, answers) => {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(answers);
    }
  });
};

/**
 * List of Answers (for Game class)
 */
exports.allAnswersForGame = (cb) => {
  console.log(gameRegion, 'answers');
  Answer.find({ official: true, region: gameRegion })
    .select('-_id')
    .exec((err, answers) => {
      if (err) {
        console.log(err);
      } else {
        cb(answers);
      }
    });
};
