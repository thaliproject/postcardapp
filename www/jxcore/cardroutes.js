var express = require('express');

function routes (db) {
  var cardRouter = express.Router();

  cardRouter.route('/cards')
    .get(function (req, res) {

      db.allDocs({
        include_docs: true
      }).then(function (docs) {
        res.json(docs);
      }).catch(function (err) {
        res.status(err.status || 500).send(err.message || err);
      });

    });

  cardRouter.route('/cards/:cardId')
    .get(function (req,res) {

      db.get(req.params.cardId)
        .then(function (doc) {
          res.json(doc);
        })
        .catch(function (err) {
          res.status(err.status || 500).send(err.message || err);
        });

    })
    .put(function (req, res) {

      db.get(req.params.cardId, function (err, doc) {
        // Not found so let's add it
        if (err && err.status === 404) {

          db.put({_id: req.params.cardId, author: req.body.author, content: req.body.content})
            .then(function (response) {
              res.status(200).end();
            })
            .catch(function (err) {
              res.status(err.status || 500).send(err.message || err);
            });
        } else if (err) {
          res.status(err.status || 500).send(err.message || err);
        } else {
          doc.content = req.body.content;
          db.put(doc)
            .then(function () {
              res.status(200).end();
            })
            .catch(function (err) {
              res.status(err.status || 500).send(err.message || err);
            });
        }
      });
    })
    .delete(function (req, res) {

      // Race condition, so let's drop 404s if we get them
      db.get(req.params.cardId, function (err, doc) {
        if (err && err.status === 404) {
          res.status(200).end();
        } else if (err) {
          res.status(err.status || 500).send(err.message || err);
        } else {
          db.remove(doc)
            .then(function () {
              res.status(200).end();
            }).catch(function (err) {
              res.status(err.status || 500).send(err.message || err);
            });
        }
      })
    });

  return cardRouter;
};

module.exports = routes;
