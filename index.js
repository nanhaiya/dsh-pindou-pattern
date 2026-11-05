/**
 * Host half of dsh-pindou-pattern.
 *
 * Everything the studio does runs in the browser (image decoding, sampling,
 * palette mapping and canvas rendering), so the Host side has no services to
 * mount. The bundle patch still needs an entry so the profile can load and
 * dispose the plugin as a unit.
 */
export function apply() {}
