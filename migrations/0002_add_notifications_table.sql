-- Migration number: 0002 	 2024-05-04T08:52:03.499Z
CREATE TABLE IF NOT EXISTS Notification (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notification_time TEXT NOT NULL,
  push_subscription_id INTEGER NOT NULL,
  FOREIGN KEY(push_subscription_id) REFERENCES PushSubscription(push_subscription_id)
);