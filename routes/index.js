var express = require('express');
const db = require('monk')('localhost/lambda');
const { writeDockerfile, build, run } = require('../dockerfile');
const dbFunctions = db.get('functions');
var router = express.Router();
const baseUri = process.env.BASE_URI || '127.0.0.1';
const port = process.env.PORT || 3000;

/* GET home page. */
router.get('/', function(req, res, next) {
  dbFunctions.find({})
    .then(lambdas => {
      lambdas = lambdas.map(lambda => {
        lambda.url = `http://${baseUri}:${port}/run/${lambda._id}`;
        return lambda;
      });
      res.render('index', { title: 'Lambda on Digital Ocean', lambdas });
    })
});

router.post('/lambda', (req, res) => {
  const imageName = req.body.name.replace(/ /g, '').toLowerCase();

  writeDockerfile(req.body.uri, imageName)
    .then(() => build(imageName))
    .then(() => {
      return dbFunctions.insert({name: req.body.name, uri: req.body.uri, imageName})  
    })
    .then(thing => res.redirect('/'))
    .catch(error => console.error(error));
  
});

router.post('/run/:id', (req, res) => {
  const _id = req.params.id;
  const data = {body: req.body};
  // const data = {body: {first: 2, second: 3}};

  dbFunctions.findOne({_id})
    .then(lambdaFunction => {
      return run(lambdaFunction.imageName, JSON.stringify(data));
    })
    .then(dockerResult => {
      res.json({result: Number(dockerResult)});
    })
    .catch(error => res.json({error}));
});

module.exports = router;
