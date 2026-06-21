# Admin Fix Report

## Scope

- Replaced dashboard placeholders with backend-backed summary data.
- Wired verification intake card to live pending requests from the new admin summary API.
- Enabled direct company moderation by consuming `GET /admin/companies/{companyId}`.
- Kept block/unblock actions available even when the page is opened from the companies list instead of a verification request.
- Fixed company list typing import and improved status badge labels for operational use.
- Increased document viewer support earlier for image-based verification review and kept historical documents visible through request history.

## Production Notes

- Admin dashboard now reflects operational counts instead of placeholder text.
- Company detail page no longer relies solely on `requestId` query state to load moderation context.
- Company history table remains the audit entry point for older submissions.

## Verification

- Manual review completed for dashboard summary wiring, company detail query fallback, and moderation mutation cache updates.
- TypeScript build could not be executed in this environment because `node` is not available on `PATH`.

## Risks / Follow-up

- Run `tsc -b` and `vite build` after restoring local Node.js access.
- Consider adding dashboard trend slices later if operations needs day-over-day movement, not only snapshot counts.
