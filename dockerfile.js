const fs = require('fs');
const {exec} = require('child_process');

function generateDockerfile(gitUri) {
    return `
    FROM node:latest
    RUN mkdir /code
    WORKDIR /code
    COPY wrapper.js /code/
    RUN git clone ${gitUri} lambda
    ENTRYPOINT ["node", "wrapper.js"]
    `;
};

function writeDockerfile(gitUri, name) {
    return new Promise((resolve, reject) => {
        const dockerfile = generateDockerfile(gitUri);
    
        fs.writeFile(`dockerfiles/${name}`, dockerfile, 'utf8', error => {
            if (error) return reject(error);
            resolve();
        });
    });
}

function build(name) {
    return new Promise((resolve, reject) => {
        exec(`docker build --no-cache -t ${name} -f dockerfiles/${name} ${__dirname}`, error => {
            if(error) return reject(error);
            resolve();
        });
    });
}

function run(name, data) {
    return new Promise((resolve, reject) => {
        exec(`docker run --rm ${name} '${data}'`, (error, stdout) => {
            if (error) return reject(error);
            resolve(stdout);
        });
    });
}

module.exports = {writeDockerfile, build, run};
