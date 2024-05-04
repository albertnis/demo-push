-- Migration number: 0001 	 2024-04-16T10:18:32.689Z
CREATE TABLE IF NOT EXISTS PushSubscription (
  push_subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,
  expiration_time TEXT,
  keys_auth TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL
);
