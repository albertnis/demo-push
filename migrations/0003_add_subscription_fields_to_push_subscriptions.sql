-- Migration number: 0003 	 2024-04-25T03:25:25.285Z
ALTER TABLE PushSubscription ADD COLUMN endpoint TEXT NOT NULL;
ALTER TABLE PushSubscription ADD COLUMN expiration_time TEXT;
ALTER TABLE PushSubscription ADD COLUMN keys_auth TEXT NOT NULL;
ALTER TABLE PushSubscription ADD COLUMN keys_p256dh TEXT NOT NULL;
