# Scribe

gdm_scribe

GDM Back-end engineer test Project

![Static Badge](https://img.shields.io/badge/Converage-100%25-green)

## Description

Scribe is a microservice API server with the purpose to receive files of integration and processing batches of data to send to the [Forge API](http://github.com/LucasRodriguesOliveira/gdm_forge) to be stored.

## Project Setup

It's highly recommended to use docker for this project

Complete and more succinct documentation can be found at Eraser (available only under direct request by email, or previously authorized by the author)

```bash
$ docker compose create --build
```

This project is expected to run with other projects such as [Whisper](https://github.com/LucasRodriguesOliveira/gdm_whisper) and [Forge](https://github.com/LucasRodriguesOliveira/gdm_forge), with **Whisper** been a dependency. So, to keep everything running smoothly, you must run **Whisper** first. With **Whisper** running, you have to include this project in the same network in order to allow **Scribe** to send messages to the queue in the **Whisper** container (the container, not the project, which is probably called `gdm_whisper-rmq-1`).

> It is up to you to decide to use the network already existing that was created when you built the `Whisper` Container (which is probably called `gdm_whisper_default`) or create a new one (If you care for some aesthetics)

To create a new network, it's pretty simple:

```bash
$ docker network create <network_name>
# I would suggest `gdm_rabbitmq` for semantics sake

$ docker network connect <network_name> gdm_whisper-rmq-1
```

Then, wether you choose create a new one or use the existing one, just add this container to the network that contains the `gdm_whisper-rmq-1` container

```bash
$ docker network connect <network_name> gdm_scribe-api-1
```

With everything in order, we can run this project right away

```bash
$ docker compose up -d
# We don't wanna that boring database logs, right? *wink*

$ docker logs --follow gdm_scribe-api-1
# Just the application logs is fine
```

**⚠️ Warning**

At this point, you don't have to worry much about this project. It will do its job, but remember that this project depends on other projects, so as a heads up: you'll have to connect the this container to a network with other container.

If you want to go a little ahead, create a network and add this project to it:

```bash
$ docker network create <some_network>
# what about `gdm_scribe_forge`?

$ docker network connect gdm_scribe_forge gdm_scribe-api-1
```

This way, **Scribe** can safely see **Forge** and send *gRPC* messages. Considering, of course, that you started this instructions with [Forge](https://github.com/LucasRodriguesOliveira/gdm_forge), right?

With that, both containers can see each other, which for Forge doesn't mean much, but 
it means everything for gdm_scribe

We're almost there! Now, go to [Hall](https://github.com/LucasRodriguesOliveira/gdm_hall) Project and Rock!

**Hall** is a FE project that helps using **Scribe**, can be run locally and it's much simpler, since the only objective is to be a helper

But you can also
 - Download Insomnia json file that contains my own instructions and samples (pretty useful)[^1]
 - Ask to participate the Insomnia organization (always up-to-date requests) (also with my samples)[^1]
 - Access OpenAPI documentation made with Swagger at `/docs` with **Scribe** project running [^2]
 - Or challenge the gods by typing at random until you can successfully open the terminal, use curl to make the request, successfully call correctly each route and get the desired behaviour (<del>or write shakespeare</del>)[^3]

## Tests

```bash
# unit tests
$ yarn test

# test coverage
$ yarn test:cov
```

## Resources

Most details can be found inside the GDM Project Documentation on Eraser

## License

Forge is [MIT licensed](https://github.com/LucasRodriguesOliveira/gdm_scribe/blob/master/LICENSE).

[^1]: Under the condition of direct request
[^2]: Obviously, open in your browser with the project running
[^3]: Let me know if you achieved it
