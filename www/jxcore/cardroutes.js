var express = require('express');
var shortid = require('shortid');

function routes (db) {
  var cardRouter = express.Router();

  cardRouter.route('/cards')
    .post(function (req, res) {
      var newCard = {
        id:shortid.generate(),
        author: req.body.author,
        content: req.body.content
      };

      db.put({
        _id: newCard.id,
        author: newCard.author,
        content: newCard.content
      }).then(function (response) {
        return db.get(response.id);
      })
      .then(function (doc) {
        res.status(201).send(doc);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });

    })
    .get(function (req, res) {

      db.allDocs({
        include_docs: true
      }).then(function (docs) {
        res.status(200).json(docs);
      }).catch(function (err) {
        res.status(err.status).send(err.message);
      });

    });

    cardRouter.route('/cards/:cardId')
      .get(function (req,res) {

        db.get(req.params.cardId)
          .then(function (doc) {
            res.status(200).json(doc);
          })
          .catch(function (err) {
            res.status(err.status).send(err.message);
          });

      })
      .put(function (req, res) {

        db.get(req.params.cardId)
          .then(function (doc) {
            return db.put({
              _id: doc._id,
              _rev: doc._rev,
              author: req.body.author,
              content: req.body.content
            });
          })
          .then(function (response) {
            res.status(204).end();
          })
          .catch(function (err) {
            res.status(err.status).send(err.message);
          });

      })
      .delete(function(req, res) {

        db.get(req.params.cardId)
          .then(function(doc) {
            return db.remove(doc);
          })
          .then(function (result) {
            res.status(204).end();
          }).catch(function (err) {
            res.status(err.status).send(err.message);
          });

      });

  return cardRouter;
};

module.exports = routes;
