## Web worker (Pages Function):

```shell
npm run run:web
```

```shell
curl -X GET localhost:8787/notifications
```

```shell
curl -X POST localhost:8787/notifications
```

## Notifier worker (cron worker):

Run:

```shell
npm run run:notifier
```

Simulate cron run:

```shell
curl -X GET localhost:8788/__scheduled
```
