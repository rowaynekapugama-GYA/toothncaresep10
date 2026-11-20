# Dashboard check on the preview with Claude in Chrome (v2.9.0)

Run this after v2.9.0 is pushed and Vercel shows the deployment as Ready, on
https://toothncaresep10.vercel.app, before the domain switch. It checks the
parts that can only be checked on Vercel: real Vercel Blob uploads, real
SMTP2GO email, Publish (if the deploy hook is set) and the runtime logs.

Before you start:

- Be signed in to Vercel and Neon in the same Chrome window.
- Have the GYA admin login ready. **You type it yourself** when Claude asks;
  Claude never sees or stores it.
- Have one ordinary photo on the computer (a JPG of the practice, 1 to 3 MB)
  and, if you have one, a large phone photo (6 to 10 MB).

Copy everything in the box below into Claude in Chrome.

---

```
You are checking the Tooth n Care website dashboard on the preview,
https://toothncaresep10.vercel.app/admin, for GYA. Work in a new tab. Australian
English. Report pass or fail for every numbered line, with a screenshot of each
screen you check.

Rules, all the time:
- Do not type, read out or store any password. When a sign in is needed, stop
  and ask me to type it, then carry on.
- Change nothing on any real page, team member, setting or existing photo.
  Only create, change and delete the two test items named below: a photo
  called "GYA test photo, delete me" and a blog post called "GYA test post,
  delete me".
- Do not press "Publish website" unless step 9 says so.
- Do not open Users, Redirects or Site Settings fields other than to look.
- If something fails, take a screenshot, note the exact message, and carry on
  with the next line.

1. Open https://toothncaresep10.vercel.app/admin. Ask me to sign in. Pass if
   the Dashboard shows after I sign in.
2. Open each item in the left menu in turn (Dashboard, Pages, Blog Posts, Media
   Library, Team, Enquiries, SEO, Site Settings, Redirects, Users). Pass if
   each opens with no error message.
3. Media Library: upload the photo I give you (ask me for it). Pass if it
   appears as a tile with no error. Then click it, set the description to
   "GYA test photo, delete me", Save description. Pass if saved.
4. If I have a large phone photo (6 to 10 MB), upload it too. Pass if it
   uploads (the dashboard makes it smaller first) or shows a plain message;
   fail if the message is a generic error or the page hangs. Then click it
   and Delete it.
5. Click the test photo's address (it starts with /api/media/file/) or open
   it in a new tab. Pass if the photo shows.
6. Pages: open "Home" and do not change anything. Pass if the page shows with
   its photos, and the SEO tab shows the note "Changing a page's address can
   affect Google rankings. Please ask GYA." Leave without saving.
7. Blog Posts: Write a new post. Title "GYA test post, delete me". In the post
   write one heading, one bullet list of two items and one link to /contact,
   and add the test photo with the Photo button. Set the Featured photo to the
   test photo. Press "Save draft". Pass if saved with no error.
8. Press "Publish this post". Pass if the status changes to published.
9. Only if the Dashboard does NOT say "Publishing is not switched on yet": ask
   me before pressing "Publish website". If I say yes, press it, wait 3 to 5
   minutes, then open https://toothncaresep10.vercel.app/blog. Pass if the
   test post is listed and opens, and its photos show. Also open
   https://toothncaresep10.vercel.app/sitemap.xml: pass if the post's address
   is listed. If publishing is not switched on, write "not checked: deploy
   hook not set" for this line.
10. Open the test post again: "Unpublish (make it a draft)", then "Delete
    post". Pass if it is gone from the Blog Posts list.
11. Media Library: click the test photo, Delete. Pass if it is deleted. (If
    the dashboard says it is still used, write down where, and tell me.)
12. If step 9 published the post, ask me before pressing "Publish website"
    again so the post also leaves the live preview, and check /blog no longer
    lists it after a few minutes.
13. Enquiries: do not send a form. Look only. Pass if the list opens and
    "Download for Excel (CSV)" downloads a file.
14. Sign out (Log out, top right). Pass if you are back at the sign in page.
15. Open https://vercel.com, the project "toothncaresep10", Logs (Runtime
    Logs), last 1 hour. Filter on "/api". List every request with status 400
    or above: time, path, status and the message. Pass if there are none
    apart from expected ones (a 401 or 403 before signing in).
16. Open the Neon console (https://console.neon.tech), the project for
    Tooth n Care, the main branch, SQL Editor. Run only this read-only query,
    exactly as written, and nothing else:

    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'media'
      AND column_name IN ('prefix', '_objectkey')
    ORDER BY column_name;

    Pass if it returns 2 rows (_objectkey and prefix).

At the end, give me a table: number, check, pass or fail, note. Then list the
screenshots, and anything you could not check and why. Confirm that the test
photo and test post are deleted.
```

---

What each line proves:

| Line | Proves |
| --- | --- |
| 3, 5, 11 | Vercel Blob uploads work (the v2.9.0 database columns are in place) and dashboard photos are served |
| 4 | Large phone photos are made smaller in the browser before they upload |
| 7 to 10 | Writing, publishing, unpublishing and deleting a post |
| 9, 12 | Publish really publishes (only with the deploy hook set) |
| 15 | No hidden server errors |
| 16 | The two Blob columns exist on the real database (read-only) |
