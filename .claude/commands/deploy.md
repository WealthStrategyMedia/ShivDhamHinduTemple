---
description: Build, commit, and push the temple site to production (Netlify auto-deploys from main)
---

Deploy the current changes to production. Work from the Temple_Website repo root.

1. Run `git status` and review what changed. If anything looks like a secret (.env, keys), stop and tell the user.
2. Run `npm run build`. If it fails, fix the cause (do not skip it) and rebuild. Never push a failing build.
3. Stage the changed files by name, commit with a concise message about the *why* (ending with the required Co-Authored-By trailer), and `git push origin main`.
4. Netlify builds and publishes automatically in about 1-2 minutes. Verify by fetching https://shivdhamhindutemple.netlify.app (or the custom domain once live) and confirming the change is visible. Report the commit hash and whether the live site reflects it.

If $ARGUMENTS is provided, treat it as the change to make first (edit the code, preview if UI-related), then run the steps above.
