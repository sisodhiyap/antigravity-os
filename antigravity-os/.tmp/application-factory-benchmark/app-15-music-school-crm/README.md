# Music School Academy Management (Unknown Domain)

> **Application Class**: Unknown Domain Autonomous Generalization  
> **Synthesized By**: Antigravity OS v5.2 (Mission Controller Benchmark)  
> **Local Port**: `127.0.0.1:3115`  
> **Architecture**: Node.js + SQLite WAL Persistence + Glassmorphism UI + REST API  

## Features
- Student/Teacher Roster
- Instrument Course Catalog
- Lesson Timetable
- Attendance Logger
- Payment Records
- Progress Cards

## Entities & Database Tables
- `students` (Indexed by `id`, `tenant_id`, `status`)
- `teachers` (Indexed by `id`, `tenant_id`, `status`)
- `courses` (Indexed by `id`, `tenant_id`, `status`)
- `lessonschedules` (Indexed by `id`, `tenant_id`, `status`)
- `attendancerecords` (Indexed by `id`, `tenant_id`, `status`)
- `simulatedpayments` (Indexed by `id`, `tenant_id`, `status`)
- `progressreports` (Indexed by `id`, `tenant_id`, `status`)
- `notifications` (Indexed by `id`, `tenant_id`, `status`)

## Security Architecture
- **Isolation Policy**: Role separation between Teacher, Admin, and Student records
- **Path Traversal Defense**: Strictly sandboxed to relative safe bounds.
- **Access Control**: Tenant token boundary enforcement.

## Run Locally
```bash
cd source
node server.js
```
