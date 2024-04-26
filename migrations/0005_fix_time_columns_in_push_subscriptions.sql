-- Migration number: 0005 	 2024-04-25T07:30:24.170Z
ALTER TABLE PushSubscription DROP COLUMN notification_time;
ALTER TABLE PushSubscription ADD COLUMN expiration_time TEXT;
