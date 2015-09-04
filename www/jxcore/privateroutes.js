var express = require('express');

function privateRoutes (db) {
    var privateRouter = express.Router();

    privateRouter.route('/test').get(function(req, res) {
        res.status(200).json({message:"wish you where here!"});
    });

    privateRouter.route('/contacts')
    	.get(function (req, res) {
        	db.allDocs({
        	    include_docs: true
        	}).then(function (docs) {
        	    res.status(200).json(docs);
        	}).catch(function (err) {
        	    res.status(err.status || 500).send(err.message || err);
        });
    });

    privateRouter.route('/contacts/:contactId')
        .get(function (req,res) {

            db.get(req.params.contactId)
                .then(function (doc) {
                    res.status(200).json(doc);
                })
                .catch(function (err) {
                    res.status(err.status || 500).send(err.message || err);
                });

        })
        .put(function (req, res) {

            db.get(req.params.contactId, function (err, doc) {
                // Not found so let's add it
                if (err && err.status === 404) {

                    db.put({
                            _id: req.params.contactId, 
                            username: req.body.username, 
                            dateCreated: Math.floor((new Date()).getTime() / 1000)
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
            db.get(req.params.contactId, function (err, doc) {
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

    return privateRouter;
};

module.exports = privateRoutes;