var express = require('express');

function routes (db) {
    var cardRouter = express.Router();

    // notes: we are running SPA in Polymer, so all I want is JSON response
    cardRouter.route('/login').post(function(req, res) {
        var userName = req.body.username.trim();
        res.setHeader('Content-Type', 'application/json');
        console.log("userName:" + userName);
        if (userName.length > 0) {
            db.get('me', function (err, doc) {
              if (err && err.status === 404) {
                db.put({ _id: 'me', user: userName })
                .then(function () {
                    //res.render('ejs/index', { user: userName });
                    res.send(JSON.stringify({ user: userName }));
                })
                .catch(function (err) {
                    //res.render('ejs/login', { error: err });
                    res.send(JSON.stringify({ error: err }));
                });
            } else if (err) {
                //res.render('ejs/login', { error: err });
                res.send(JSON.stringify({ error: err }));
            } else {
        // Change the user name if it doesn't match
        if (doc.user !== userName) {
            doc.user = userName;
            db.put(doc)
            .then(function () {
                //res.render('ejs/index', { user: userName });
                res.send(JSON.stringify({ user: userName }));
            })
            .catch(function (err) {
                //res.render('ejs/login', { error: err });
                res.send(JSON.stringify({ error: err }));
            });
        } else {
            //res.render('ejs/index', { user: userName });
            res.send(JSON.stringify({ user: userName }));
        }
    }
});
        } else {
            //res.render('ejs/login', { error: 'User name is required' });
            res.send(JSON.stringify({ error: 'User name is required' }));
        }
    });

    cardRouter.route('/cards')
        .get(function (req, res) {

            db.allDocs({
                include_docs: true
            }).then(function (docs) {
                res.status(200).json(docs);
            }).catch(function (err) {
                res.status(err.status || 500).send(err.message || err);
            });

        });

    cardRouter.route('/cards/:cardId')
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

                    db.put({_id: req.params.cardId, author: req.body.author, content: req.body.content})
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
            })
        });

    return cardRouter;
};

module.exports = routes;