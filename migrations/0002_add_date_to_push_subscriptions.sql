-- Migration number: 0002 	 2024-04-22T09:08:48.398Z
ALTER TABLE PushSubscription
ADD COLUMN notification_time TEXT NOT NULL;
