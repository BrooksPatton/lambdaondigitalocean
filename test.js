function lambda({ body, query }, done) {
    done(body.first + body.second);
  }
  
  module.exports = lambda;