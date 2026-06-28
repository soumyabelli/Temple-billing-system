# Temple Billing System - TODO

## Booking 500 Internal Server Error (Devotee)
- [ ] Add server-side error details for devotee booking creation (log actual error, return message)
- [ ] Make booking creation resilient to notification/bill failures by not failing the whole request
- [ ] Align devotee booking API payload validation with Booking model requirements (gst, paymentMethod enums, datetime format)
- [ ] (Optional) Add frontend payload normalization for createDevoteeBooking
- [ ] Run backend tests: create booking request and verify 201 response

