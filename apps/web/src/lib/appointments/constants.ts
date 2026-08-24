// Duplicated from packages/core/src/appointments/service.ts's
// CANCELLATION_WINDOW_HOURS: this file is imported by a client component
// (appointment-row.tsx), and importing it from @psikosanal/core would pull
// the server-only @psikosanal/db client into the client bundle.
export const CANCELLATION_WINDOW_HOURS = 24;
