#!/usr/bin/env node
// Checks data/moments.json against the moment schema.
// Errors fail the run. "Still to write" lists fields that are valid but empty.
// Usage: node scripts/validate-moments.mjs [path/to/moments.json]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = process.argv[2] ?? fileURLToPath(new URL('../data/moments.json', import.meta.url));

let moments;
try {
  moments = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`moments.json is not valid JSON: ${err.message}`);
  process.exit(1);
}
if (!Array.isArray(moments)) {
  console.error('moments.json must be an array of moments');
  process.exit(1);
}

const CATEGORIES = ['cultural_classic', 'hidden_gem'];
const FACTS = ['historical_context', 'cultural_moment', 'why_it_matters', 'formal_innovation'];
const CONNECTIONS = ['influenced_by', 'influenced', 'contemporaries'];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RATIO = /^\d\.\d{2}:1$/;

const slug = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const isText = v => typeof v === 'string';
const isYear = v => Number.isInteger(v) && v >= 1880 && v <= 2100;

const errors = [];
const todo = [];
const ids = new Set();
const seedSentences = new Map();

function checkPlace(id, where, place) {
  if (!place || typeof place !== 'object') return errors.push(`${id}: ${where} is missing`);
  for (const k of ['city', 'country']) {
    if (!isText(place[k]) || !place[k].trim()) errors.push(`${id}: ${where}.${k} is empty`);
  }
  const c = place.coordinates;
  if (!Array.isArray(c) || c.length !== 2 || !c.every(n => typeof n === 'number')) {
    return errors.push(`${id}: ${where}.coordinates must be [lat, lng]`);
  }
  if (Math.abs(c[0]) > 90 || Math.abs(c[1]) > 180) errors.push(`${id}: ${where}.coordinates are out of range`);
}

for (const m of moments) {
  const id = m.id ?? '(no id)';

  if (!isText(m.id) || !ID.test(m.id)) errors.push(`${id}: id must be lowercase-kebab-case`);
  if (ids.has(id)) errors.push(`${id}: duplicate id`);
  ids.add(id);

  checkPlace(id, 'primary_location', m.primary_location);
  if (!Array.isArray(m.additional_locations)) {
    errors.push(`${id}: additional_locations must be an array`);
  } else {
    m.additional_locations.forEach((place, i) => {
      checkPlace(id, `additional_locations[${i}]`, place);
      if (!isText(place?.role) || !place.role.trim()) errors.push(`${id}: additional_locations[${i}].role is empty`);
    });
  }

  if ('year' in m) errors.push(`${id}: "year" is now year_set + year_released`);
  if (!isYear(m.year_released)) errors.push(`${id}: year_released must be a year`);
  if (m.year_set === null) todo.push(`${id}: year_set`);
  else if (!isYear(m.year_set)) errors.push(`${id}: year_set must be a year or null`);

  const film = m.film ?? {};
  if (!isText(film.title) || !film.title.trim()) errors.push(`${id}: film.title is empty`);
  if (!isText(film.director) || !film.director.trim()) errors.push(`${id}: film.director is empty`);
  if (!Number.isInteger(film.runtime_minutes) || film.runtime_minutes <= 0) errors.push(`${id}: film.runtime_minutes must be a whole number of minutes`);
  if (!RATIO.test(film.aspect_ratio ?? '')) errors.push(`${id}: film.aspect_ratio should look like 2.39:1`);
  if (film.poster_url !== null) errors.push(`${id}: film.poster_url must be null (the app uses placeholder frames)`);
  if (!Array.isArray(film.still_urls) || film.still_urls.length) errors.push(`${id}: film.still_urls must be empty (the app uses placeholder frames)`);

  if (isText(m.id) && isText(film.title) && isYear(m.year_released)) {
    const start = slug(film.title);
    if (!m.id.startsWith(start + '-') || !m.id.endsWith('-' + m.year_released)) {
      errors.push(`${id}: id should be ${start}-<place>-${m.year_released}`);
    }
  }

  if (!CATEGORIES.includes(m.category)) errors.push(`${id}: category must be one of ${CATEGORIES.join(', ')}`);

  if (!isText(m.location_thesis)) errors.push(`${id}: location_thesis is missing`);
  else if (!m.location_thesis.trim()) todo.push(`${id}: location_thesis`);

  for (const k of FACTS) {
    const v = m.facts?.[k];
    if (!isText(v)) errors.push(`${id}: facts.${k} is missing`);
    else if (!v.trim()) todo.push(`${id}: facts.${k}`);
  }

  for (const k of CONNECTIONS) {
    const list = m.connections?.[k];
    if (!Array.isArray(list)) { errors.push(`${id}: connections.${k} must be an array`); continue; }
    for (const ref of list) {
      if (!isText(ref) || !ID.test(ref)) errors.push(`${id}: connections.${k} has "${ref}" (use ids like oldboy-2003)`);
    }
  }

  // A seed should be written for its own moment. Catch sentences pasted from another one.
  if (!isText(m.llm_narrative_seed) || !m.llm_narrative_seed.trim()) {
    todo.push(`${id}: llm_narrative_seed`);
  } else {
    for (const sentence of m.llm_narrative_seed.split(/(?<=[.!?])\s+/)) {
      if (sentence.length < 40) continue;
      const other = seedSentences.get(sentence);
      if (other && other !== id) errors.push(`${id}: narrative seed repeats a sentence from ${other}: "${sentence}"`);
      else seedSentences.set(sentence, id);
    }
  }

  if (!isText(m.curator_notes)) errors.push(`${id}: curator_notes is missing`);
}

const unfinished = new Set(todo.map(t => t.split(':')[0]));
console.log(`${moments.length} moments, ${moments.length - unfinished.size} complete`);

if (todo.length) {
  console.log('\nStill to write:');
  for (const t of todo) console.log(`  - ${t}`);
}
if (errors.length) {
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
