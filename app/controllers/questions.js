/**
 * Module dependencies.
 */
let mongoose = require('mongoose'),
  async = require('async'),
  Question = mongoose.model('Question'),
  _ = require('underscore'),
  gameRegion;


/**
 * Find question by id
 */
exports.question = (req, res, next, id) => {
  Question.load(id, (err, question) => {
    if (err) return next(err);
    if (!question) return next(new Error('Failed to load question ' + id));
    req.question = question;
    next();
  });
};

/**
 * Show an question
 */
exports.show = (req, res) => {
  res.jsonp(req.question);
};


exports.byRegion = (req, res) => {
  gameRegion = req.query.id;
  res.send('yipeee');
};

/**
 * List of Questions
 */
exports.all = (req, res) => {
  Question.find({ official: true, numAnswers: { $lt: 3 } }).select('-_id').exec((err, questions) => {
    if (err) {
      res.render('error', {
          status: 500
        });
    } else {
      res.jsonp(questions);
    }
  });
};

/**
 * List of Questions (for Game class)
 */
exports.allQuestionsForGame = (cb) => {
  Question.find({ official: true, numAnswers: { $lt: 3 }, region: gameRegion }).select('-_id').exec((err, questions) => {
    if (err) {
      console.log(err);
    } else {
      cb(questions);
    }
  });
};

