// Booking & Appointment Scheduler Module - Autonomously Patched
export interface TimeSlot {
  startTime: string;
  endTime: string;
  booked: boolean;
}

export function isSlotAvailable(slots: TimeSlot[], targetStart: string): boolean {
  const match = slots.find(s => s.startTime === targetStart);
  return match ? !match.booked : false;
}

export function bookSlot(slots: TimeSlot[], targetStart: string): boolean {
  const match = slots.find(s => s.startTime === targetStart && !s.booked);
  if (match) {
    match.booked = true;
    return true;
  }
  return false;
}
