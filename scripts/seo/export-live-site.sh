#!/bin/bash
# Exports the current live Tooth n Care website (www.toothncare.com.au, before the switch)
# for the URL parity check: every address in its robots.txt and sitemaps plus every page
# reached by following its own links, with the SEO details of each.
#
#   bash scripts/seo/export-live-site.sh
#   (or: bash scripts/seo/export-live-site.sh https://www.toothncare.com.au 1000)
#
# Needs only curl and perl (both on every Mac). No logins, nothing secret.
# Writes live-site-export-<date>.csv, live-site-assets-<date>.txt and a zip of both in
# your Downloads folder, and prints where they are. Upload the zip to the Claude chat.
#
# Then check the new site against it:
#   node scripts/seo/check-url-parity.mjs --base https://toothncaresep10.vercel.app \
#     --list docs/seo/old-urls.txt --list ~/Downloads/live-site-export-<date>.csv \
#     --old ~/Downloads/live-site-export-<date>.csv

set -uo pipefail
SITE="${1:-https://www.toothncare.com.au}"
SITE="${SITE%/}"
LIMIT="${2:-1000}"
HOST="$(printf '%s' "$SITE" | perl -pe 's{^https?://}{}; s{/.*}{}')"
BARE="${HOST#www.}"
DATE="$(date +%Y-%m-%d)"
OUTDIR="$HOME/Downloads"
[ -d "$OUTDIR" ] || OUTDIR="$PWD"
CSV="$OUTDIR/live-site-export-$DATE.csv"
ASSETS="$OUTDIR/live-site-assets-$DATE.txt"
ZIP="$OUTDIR/live-site-export-$DATE.zip"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/live-export.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT
UA="GYA site export (parity check before moving the website)"

say() { printf '\033[1m%s\033[0m\n' "$*"; }
command -v curl >/dev/null || { echo "curl is missing"; exit 1; }
command -v perl >/dev/null || { echo "perl is missing"; exit 1; }

# the path of a same-site link, or nothing (other sites, mail, phone, anchors)
norm() {
  perl -e '
    my ($u, $base, $bare) = @ARGV;
    $u =~ s/^\s+|\s+$//g; $u =~ s/&amp;/&/g; $u =~ s/#.*$//;
    exit if $u eq "" || $u =~ /^(mailto|tel|javascript|data):/i;
    if ($u =~ m{^//}) { $u = "https:$u" }
    if ($u =~ m{^https?://([^/]+)(/.*)?$}i) { my ($h, $p) = (lc $1, $2 // "/"); exit unless $h eq $bare || $h eq "www.$bare"; $u = $p }
    elsif ($u !~ m{^/}) { (my $d = $base) =~ s{[^/]*$}{}; $u = "$d$u" }
    1 while $u =~ s{/[^/]+/\.\./}{/}; $u =~ s{/\./}{/}g;
    print "$u\n";
  ' "$1" "$2" "$BARE"
}

say "1. robots.txt and sitemaps of $SITE"
: > "$WORK/queue"; : > "$WORK/seen"; : > "$WORK/sitemaps"; : > "$WORK/assets"
curl -s -A "$UA" -L --max-time 30 "$SITE/robots.txt" > "$WORK/robots.txt" || true
grep -i '^sitemap:' "$WORK/robots.txt" | perl -pe 's/^sitemap:\s*//i; s/\r//' >> "$WORK/sitemaps"
for s in /sitemap.xml /sitemap_index.xml /wp-sitemap.xml /page-sitemap.xml /post-sitemap.xml; do echo "$SITE$s" >> "$WORK/sitemaps"; done
sort -u "$WORK/sitemaps" -o "$WORK/sitemaps"
i=0
while :; do
  i=$((i+1)); [ $i -le 200 ] || break
  sm=$(sed -n "${i}p" "$WORK/sitemaps"); [ -n "$sm" ] || break
  code=$(curl -s -A "$UA" -L --max-time 30 -o "$WORK/sm.xml" -w '%{http_code}' "$sm")
  [ "$code" = "200" ] || continue
  grep -qi '<urlset\|<sitemapindex' "$WORK/sm.xml" || continue
  echo "   $sm"
  # nested sitemap indexes go on the end of the list
  perl -ne 'while (/<sitemap>\s*<loc>\s*([^<]+?)\s*<\/loc>/gi) { print "$1\n" }' "$WORK/sm.xml" | while IFS= read -r child; do
    grep -qxF "$child" "$WORK/sitemaps" || echo "$child" >> "$WORK/sitemaps"
  done
  perl -0ne 's/<sitemap>.*?<\/sitemap>//gis; while (/<loc>\s*([^<]+?)\s*<\/loc>/gi) { print "$1\n" }' "$WORK/sm.xml" | while IFS= read -r loc; do
    p=$(norm "$loc" "/"); [ -n "$p" ] && printf '%s\tsitemap\n' "$p" >> "$WORK/queue"
  done
done
printf '/\thomepage\n' >> "$WORK/queue"
echo "   $(cut -f1 "$WORK/queue" | sort -u | wc -l | tr -d ' ') addresses from the sitemaps"

say "2. Crawling the site's own links (up to $LIMIT addresses)"
echo 'url,source,status,final_url,redirect_hops,title,meta_description,canonical,meta_robots,h1,google_site_verification,tracking_ids' > "$CSV"
count=0
while :; do
  line=$(grep -vxFf "$WORK/seen" <(cut -f1 "$WORK/queue") | head -1)
  [ -n "$line" ] || break
  [ $count -lt "$LIMIT" ] || break
  p="$line"; echo "$p" >> "$WORK/seen"; count=$((count+1))
  src=$(grep -m1 -F "$p"$'\t' "$WORK/queue" | cut -f2)
  case "$p" in
    *.jpg|*.jpeg|*.png|*.gif|*.webp|*.svg|*.ico|*.css|*.js|*.woff|*.woff2|*.ttf|*.mp4|*.zip|*.webmanifest|*.json) echo "$p" >> "$WORK/assets"; continue ;;
  esac
  meta=$(curl -s -A "$UA" -L --max-time 30 --max-redirs 10 -o "$WORK/page.html" -w '%{http_code}\t%{url_effective}\t%{num_redirects}\t%{content_type}' "$SITE$p")
  code=$(printf '%s' "$meta" | cut -f1); final=$(printf '%s' "$meta" | cut -f2); hops=$(printf '%s' "$meta" | cut -f3); ctype=$(printf '%s' "$meta" | cut -f4)
  case "$ctype" in
    *pdf*) echo "$p (PDF)" >> "$WORK/assets" ;;
  esac
  row=$(perl -0e '
    my ($file) = @ARGV; local $/; open my $f, "<", $file or exit; my $h = <$f>;
    sub clean { my $s = shift // ""; $s =~ s/<[^>]+>//g; $s =~ s/&amp;/&/g; $s =~ s/&nbsp;/ /g; $s =~ s/\s+/ /g; $s =~ s/^ | $//g; $s =~ s/"/""/g; return "\"$s\"" }
    sub meta { my $n = shift; return $1 if $h =~ /<meta\b[^>]*(?:name|property)=["\x27]\Q$n\E["\x27][^>]*content=["\x27]([^"\x27]*)/i; return $1 if $h =~ /<meta\b[^>]*content=["\x27]([^"\x27]*)["\x27][^>]*(?:name|property)=["\x27]\Q$n\E["\x27]/i; return "" }
    my ($t) = $h =~ /<title[^>]*>(.*?)<\/title>/is;
    my ($c) = $h =~ /<link\b[^>]*rel=["\x27]canonical["\x27][^>]*href=["\x27]([^"\x27]+)/i;
    ($c) = $h =~ /<link\b[^>]*href=["\x27]([^"\x27]+)["\x27][^>]*rel=["\x27]canonical/i unless $c;
    my ($h1) = $h =~ /<h1\b[^>]*>(.*?)<\/h1>/is;
    my %ids; $ids{$1}++ while $h =~ /\b(G-[A-Z0-9]{6,12}|UA-\d{4,10}-\d{1,3}|GTM-[A-Z0-9]{4,10}|AW-\d{6,12})\b/g;
    $ids{"pixel:$1"}++ while $h =~ /fbq\(\s*["\x27]init["\x27]\s*,\s*["\x27](\d{8,20})/g;
    print join(",", clean($t), clean(meta("description")), clean($c), clean(meta("robots")), clean($h1), clean(meta("google-site-verification")), clean(join(" ", sort keys %ids)));
  ' "$WORK/page.html")
  printf '"%s",%s,%s,"%s",%s,%s\n' "$p" "$src" "$code" "$final" "$hops" "${row:-,,,,,,}" >> "$CSV"
  printf '   %4d  %s  %s\n' "$count" "$code" "$p"
  # same-site links, PDFs, uploads, feeds and ?p= style addresses go on the list
  if printf '%s' "$ctype" | grep -qi html; then
    perl -ne 'while (/\b(?:href|src)=["\x27]([^"\x27]+)["\x27]/gi) { print "$1\n" }' "$WORK/page.html" | while IFS= read -r ref; do
      q=$(norm "$ref" "$p"); [ -n "$q" ] || continue
      case "$q" in
        *.jpg|*.jpeg|*.png|*.gif|*.webp|*.svg|*.ico|*.css|*.js|*.woff|*.woff2|*.webmanifest|*.json) grep -qxF "$q" "$WORK/assets" || echo "$q" >> "$WORK/assets"; continue ;;
      esac
      grep -qF "$q"$'\t' "$WORK/queue" || printf '%s\tlink on %s\n' "$q" "$p" >> "$WORK/queue"
    done
  fi
done

say "3. Files and special addresses"
{
  echo "# Pictures, PDFs and other files linked from the live site (not pages)."
  sort -u "$WORK/assets"
  echo
  echo "# Feeds, query-string addresses (?p=, ?page_id=) and admin paths seen:"
  cut -f1 "$WORK/queue" | grep -Ei '/feed/?$|\?p=|\?page_id=|/wp-|/cmadmin' | sort -u
} > "$ASSETS"
( cd "$OUTDIR" && zip -q -j "$ZIP" "$CSV" "$ASSETS" robots.txt 2>/dev/null || zip -q -j "$ZIP" "$CSV" "$ASSETS" )
cp "$WORK/robots.txt" "$OUTDIR/live-site-robots-$DATE.txt" 2>/dev/null && ( cd "$OUTDIR" && zip -q -j "$ZIP" "live-site-robots-$DATE.txt" )

say "Done: $count addresses."
echo "   $CSV"
echo "   $ASSETS"
echo "   $ZIP   <- upload this one to the Claude chat"
echo "   Tracking or verification codes found: $(perl -ne 'print "$1 " if /,"([^"]*)"\s*$/ && $1' "$CSV" | tr ' ' '\n' | sort -u | grep -v '^$' | tr '\n' ' ')"
