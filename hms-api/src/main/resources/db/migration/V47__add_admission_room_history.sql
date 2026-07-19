CREATE TABLE admission_room_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    from_date DATETIME(6) NOT NULL,
    to_date DATETIME(6) NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_admission_room_history_admission FOREIGN KEY (admission_id) REFERENCES admission (id),
    CONSTRAINT fk_admission_room_history_room FOREIGN KEY (room_id) REFERENCES room (id)
);

-- Backfill: every admission currently holding a room gets one open history
-- period covering its stay so far in that room, so ward/bed billing keeps
-- computing identically to the pre-history flat calculation until a real
-- Ward Change happens.
INSERT INTO admission_room_history (admission_id, room_id, from_date, to_date, created_at, updated_at)
SELECT id, room_id, admission_date, NULL, NOW(), NOW()
FROM admission
WHERE room_id IS NOT NULL;
