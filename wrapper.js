const lambda = require('./lambda/index');

const args = process.argv.slice(2);

lambda(JSON.parse(args), result => console.log(result));