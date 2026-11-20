# Handing the dashboard to Tooth n Care (GYA only)

Do this **after go-live** (the launch date is still to be confirmed with the
practice; Monday 23 November 2026 was proposed), once the domain is switched and the after-switch steps in `docs/GO-LIVE.md`
are done, so the practice signs in at www.toothncare.com.au/admin from day
one. No logins are created before then.

## 1. What you need from the practice

- The email address of each person who should have a login (one each, no
  shared logins). Christine has been asked for these.
- A phone number for each, to give the temporary password.

## 2. Create each login (Editor role)

1. Sign in at **www.toothncare.com.au/admin** with the GYA admin login.
2. **Users**, **Add a user**.
3. Name, email, role **Editor (practice staff)** (never Administrator for the
   practice).
4. The dashboard fills in a **Temporary password** (two words and a number).
   Copy it once; don't save it anywhere.
5. **Create account**. They must choose their own password the first time they
   sign in.

An Editor can change wording, photos, sections, page SEO titles and
descriptions, the team list, blog posts and enquiries, and the practice
details in Site Settings. An Editor **cannot** change a page's address, delete
a page, hide a page from Google, change redirects, users, tracking codes or
where enquiries are emailed, or open `/cms`. Those stay with GYA (tested in
v2.9.0, see `docs/VERIFICATION.md` section 19).

## 3. Send the password separately

Never put the password in the same email as the login, in SmileOX, in a
WhatsApp group or in a shared document.

- **Best:** phone the person and read it out, or
- a **one-time link** (for example 1Password's "Share item" with "Only one
  person, expires after 1 view", or onetimesecret.com). Send the link by SMS,
  and the login email by email.

## 4. Email to each person (template)

> Subject: Your Tooth n Care website login
>
> Hi [first name],
>
> You now have your own login to the Tooth n Care website dashboard, where you
> can change wording and photos, add blog posts and see enquiries.
>
> Sign in at: www.toothncare.com.au/admin
> Your login email: [their email]
> Your temporary password: I'll send it to you separately [by phone / by text
> message as a one-time link].
>
> The first time you sign in you'll choose your own password (at least 10
> characters, with letters and numbers). The guide is attached
> (Tooth-n-Care-Website-Guide.pdf).
>
> Changes only go on the website when you press Publish website, so feel free
> to look around. For anything about offers, prices, dentists' details, the
> Privacy Policy or Terms, or a new page, just ask me.
>
> Kind regards,
> Rowayne
> GYA

## 5. SmileOX note (template, no passwords)

> Website dashboard handed over [date]. Logins (Editor) for: [names]. Temporary
> passwords given separately [by phone / one-time link]; none recorded here.
> Guide sent: Tooth-n-Care-Website-Guide.pdf (v2.9.0). Enquiries go to
> reception@toothncare.com.au and rowayne@gyaclients.com (SmileOX intake
> address to be added in Site Settings once supplied). Still open: [anything
> from GO-LIVE.md].

## 6. Afterwards

- Ask each person to sign in once while you are on the phone, so a typo in an
  email address shows up straight away.
- When someone leaves the practice: **Users**, delete their login the same
  day.
- **Forgotten password:** **Users**, the person, **Reset password**, **Set
  temporary password**, and send it the same way (section 3).
