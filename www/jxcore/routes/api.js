var express = require('express');

function postcardRoutes (db) {
    var router = express.Router();

    router.route('/cards')
        .get(function (req, res) {

            db.allDocs({
                include_docs: true
            }).then(function (docs) {
                res.status(200).json(docs);
            }).catch(function (err) {
                res.status(err.status || 500).send(err.message || err);
            });

        });

    router.route('/cards/:cardId')
        .get(function (req,res) {

            db.get(req.params.cardId)
                .then(function (doc) {
                    res.status(200).json(doc);
                })
                .catch(function (err) {
                    res.status(err.status || 500).send(err.message || err);
                });

        })
        .put(function (req, res) {

            db.get(req.params.cardId, function (err, doc) {
                // Not found so let's add it
                if (err && err.status === 404) {

                    db.put({
                            _id: req.params.cardId,
                            author: req.body.author,
                            content: req.body.content,
                            dateCreated: new Date().getTime()
                        })
                        .then(function (response) {
                            res.status(200).json(response);
                        })
                        .catch(function (err) {
                            res.status(err.status || 500).send(err.message || err);
                        });
                } else if (err) {
                    res.status(err.status || 500).send(err.message || err);
                } else {
                    doc.content = req.body.content;
                    db.put(doc)
                        .then(function (response) {
                            res.status(200).json(response);
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
                        .then(function (response) {
                            res.status(200).json(response);
                        }).catch(function (err) {
                            res.status(err.status || 500).send(err.message || err);
                        });
                }
            });
        });

      router.route('/destroy').delete(function (req, res) {
          db.destroy().then(function (response) {
            console.log("destroyed cards db");
            res.status(200).json(response); // success
          }).catch(function (err) {
            console.log(err);
            res.status(err.status || 500).send(err.message || err);
          });
      });

    return router;
}

module.exports = postcardRoutes;
