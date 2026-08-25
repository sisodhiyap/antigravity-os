# OMNICRAFT REAL DATA & PERSISTENCE AUDIT REPORT

## 1. Audit Principles
All numbers, metrics, analytics, user details, and media assets displayed in the OmniCraft workspace represent real application states. 

- **No Placeholders**: Hardcoded statistics, fake transactions, placeholder strings, and mock reviews are strictly forbidden in production.
- **Empty States**: If a workspace contains no generated media, the interface displays an explicit `NO_DATA` empty state rather than inventing fake progress or entries.

---

## 2. Persisted Production Entities (Prisma DB Mapping)

All core application schemas map directly to relational Postgres/SQLite models:

* **`User`**: Real authenticated operator profile records.
* **`Project`**: Persistent campaign workspace entries.
* **`GenerationJob`**: Real-time generation job status ledger.
* **`Asset` & `AssetVersion`**: Canonical registry entries linked to unique SHA-256 file hashes.
* **`ProviderHealth`**: Heartbeat logs for each configured AI adapter.
* **`UsageEvent` & `CostLedger`**: Audit events mapping token usage to spent budgets.
* **`AuditLog`**: Immutable history records for all project creations and generation starts.
