[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/FoundersAS/walkiebot)


# Walkiebot

    $ npm i
    $ npm start dev

    Start coding/hacking/WorkWork.

Open:
* http://localhost:8005 for webpack
* http://localhost:8000 for production server/api

# Notes:

## Load backup from mlabs into local env

* Download mlabs dump
* Run a local container for mongo: `docker run -it --name mlabs-mongo --rm -p 27019:27017 mongo:3.2`
* Get address for previous container: `docker run  --rm  --link mlabs-mongo  -v `pwd`:/backup  mongo:3.2  bash -c "env" | grep MLABS_MONGO_PORT_27017_TCP_ADDR`
* Use address instead of 172.17.0.3 with the next container
* Run a container that links to the previous one and runs mongorestore: `docker run  --rm  --link mlabs-mongo:mongo  -v `pwd`:/backup  mongo:3.2  bash -c "mongorestore /backup --host 172.17.0.3"`
* Now you can connect on `localhost:27019` :+1:
