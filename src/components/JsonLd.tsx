/**
 * Structured-data script tag.
 *
 * `JSON.stringify` does not escape `<`, so any embedded string containing
 * `</script>` terminates the tag early and everything after it is parsed as
 * HTML. Product pages embed review author names and bodies, which anyone can
 * submit through the public review endpoint — that made this a stored XSS
 * vector. Escaping the three characters that can start a tag-close or an HTML
 * comment keeps the payload valid JSON while making breakout impossible.
 */
function serialize(data: Record<string, unknown>) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />;
}
