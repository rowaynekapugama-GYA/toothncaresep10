const SCRIPT = `
(function () {
  var form = document.getElementById('enquiryForm');
  if (!form) return;
  var status = document.getElementById('enquiryStatus');
  var button = form.querySelector('button[type="submit"]');
  var stamp = form.querySelector('input[name="renderedAt"]');
  if (stamp) stamp.value = String(Date.now());

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(function (n) { n.remove(); });
    form.querySelectorAll('.has-error').forEach(function (n) { n.classList.remove('has-error'); });
  }

  function showError(name, message) {
    var input = form.querySelector('[name="' + name + '"]');
    if (!input) return;
    var field = input.closest('.field') || input.parentElement;
    if (field) field.classList.add('has-error');
    var note = document.createElement('span');
    note.className = 'field-error';
    note.textContent = message;
    (field || form).appendChild(note);
  }

  function say(text, tone) {
    if (!status) return;
    status.className = 'form-status' + (tone ? ' is-' + tone : '');
    status.innerHTML = text;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearErrors();
    say('', '');

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    data.consent = form.querySelector('[name="consent"]').checked;
    data.sourcePage = window.location.pathname;

    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    var label = button.textContent;
    button.textContent = 'Sending...';

    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json().then(function (body) { return { res: res, body: body }; }); })
      .then(function (out) {
        if (out.res.ok) {
          form.reset();
          if (stamp) stamp.value = String(Date.now());
          say('Thank you. Your message is on its way and we will be in touch shortly.', 'ok');
          return;
        }
        if (out.body && out.body.errors) {
          Object.keys(out.body.errors).forEach(function (key) { showError(key, out.body.errors[key]); });
          say('Please check the highlighted fields and try again.', 'bad');
          return;
        }
        say(out.body && out.body.error ? out.body.error : 'Sorry, that did not send. Please call us on {{PHONE}}.', 'bad');
      })
      .catch(function () {
        say('Sorry, that did not send. Please call us on <a href="{{PHONE_HREF}}">{{PHONE}}</a> and we will help straight away.', 'bad');
      })
      .then(function () {
        button.removeAttribute('aria-busy');
        button.disabled = false;
        button.textContent = label;
      });
  });
})();
`

/** Makes the enquiry form work. Plain script, like the rest of the site's behaviour. */
export default function EnquiryScript({ tokens }: { tokens: Record<string, string> }) {
  const js = SCRIPT.split('{{PHONE_HREF}}')
    .join(tokens.phoneHref ?? '')
    .split('{{PHONE}}')
    .join(tokens.phone ?? '')
  return (
    <>
      <link rel="stylesheet" href="/styles/forms.css" precedence="site" />
      <script dangerouslySetInnerHTML={{ __html: js }} />
    </>
  )
}
