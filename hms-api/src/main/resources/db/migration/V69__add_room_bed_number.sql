-- Optional bed number alongside room number, so a hospital with multiple beds
-- in one physical room (e.g. a General ward) can catalog each bed as its own
-- row sharing the same room_number. Rooms that don't use this (bed_number
-- left null) keep today's exact guarantee of a globally unique room_number,
-- enforced in RoomService rather than at the DB level, since MySQL treats
-- multiple NULLs in a unique index as distinct.

ALTER TABLE room ADD COLUMN bed_number VARCHAR(50) NULL AFTER room_number;
ALTER TABLE room ADD CONSTRAINT uq_room_number_bed_number UNIQUE (room_number, bed_number);
ALTER TABLE room DROP INDEX uq_room_number;
