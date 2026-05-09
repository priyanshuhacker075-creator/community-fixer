2. Fake Reports Detection
Current: Already has isGenuine check in analyze-photo.functions.ts (stock photo, AI-generated detection)
Enhancements:
- Add duplicate detection (same location/description within timeframe)
- Add user reputation score (new users' reports marked for review)
- Flag reports with low confidence scores
- Admin can mark reports as "fake" and reporter gets flagged
---
3. Automatic Critical/High Severity Notifications
Current: Manual via admin panel
Automation:
- In report.tsx submit function, check severity
- If critical/high, automatically call notify function
- Add a delay so admin can review first (optional)
- Store "auto-notified" flag
---
4. Activity Updates by Admin
Add to admin panel:
- Add comment/note field in issue detail modal
- Pre-defined response templates (e.g., "Investigating", "Crew dispatched")
- Email notification to reporter when admin adds update
---
Suggested Implementation Order
1. Admin Login (simplest, protects admin features)
2. Auto-notify for critical/high (quick win, builds on existing notification)
3. Activity updates by admin (enhances admin workflow)
4. Fake report detection (more complex, uses existing AI)
---
Questions:
1. How secure does admin login need to be? Is simple password OK?
2. For automatic notifications - should it notify immediately or wait for admin review first?
3. Should fake reports be auto-rejected or just flagged for admin review?
