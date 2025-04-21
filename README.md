# Scribe

gdm_scribe

GDM Back-end engineer test Project

![Static Badge](https://img.shields.io/badge/Converage-0%25-green)

## Description

Scribe is a microservice API server with the purpose to receive files of integration and processing batches of data to send to the [Forge API](http://github.com/LucasRodriguesOliveira/gdm_forge) to be stored.

## Project Setup

```bash
  $ yarn install
```

If you wish to run using docker, this project does not rely on docker compose file, instead, 
follow the instructions bellow and keep in mind that this process consider multiple
projects that should run in a orchestration

```bash
$ docker compose build
$ docker compose up
```

**⚠️ Warning**

At this point, probably the application should not be able to see the forge api connection
due to the fact that the forge api is in an another container. This is done purposely!

To solve this issue, we must create a network and add both (which needs both to exist in a container)

```bash
$ docker network create <some_network>
$ docker network connect <forge_container_name> <some_network>
$ docker network connect <scribe_container_name> <some_network>
```

I would suggest `gdm` or `scribe_forge` instead of `<some_network>`

With that, both containers can see each other, which for Forge doesn't mean much, but 
it means everything for gdm_scribe

Thankfully, when using docker-compose, you already start with a default network.

Take a look with `docker network ls` and `docker network inspect <network_name>` to check out
the containers connected to this network (usually only shows the running ones). You can see
a list of containers at the `Containers` property

## Compile and run the project (locally)

```bash
# development
$ yarn start

## Run tests

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Resources

Most details can be found inside the GDM Project Documentation on Eraser

## License

Forge is [MIT licensed](https://github.com/LucasRodriguesOliveira/gdm_scribe/blob/master/LICENSE).

