import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function countMatches(pattern) {
  return [...html.matchAll(pattern)].length;
}

test('primary navigation targets existing page sections', () => {
  const navTargets = [...html.matchAll(/<a href="#([^"]+)"/g)].map((match) => match[1]);

  assert.ok(navTargets.includes('graph'), 'navigation should expose the intelligence graph');
  for (const target of navTargets) {
    assert.match(html, new RegExp(`<section id="${target}"`), `missing section for #${target}`);
  }
});

test('knowledge graph feature has canvas, controls, and script data', () => {
  assert.match(html, /<section id="graph">/);
  assert.match(html, /<canvas id="graphCanvas"/);
  assert.equal(countMatches(/data-focus-node="/g), 4);
  assert.match(html, /const graphNodes = \[/);
  assert.match(html, /function updateGraphPanel/);
  assert.match(html, /function drawGraph/);
});

test('portfolio detail cards are keyboard accessible and backed by modal data', () => {
  const projectKeys = [...html.matchAll(/data-project="([^"]+)"/g)].map((match) => match[1]);
  const uniqueKeys = new Set(projectKeys);

  assert.equal(projectKeys.length, 6);
  assert.equal(uniqueKeys.size, 6);
  assert.equal(countMatches(/role="button" tabindex="0" data-project="/g), 6);
  assert.match(html, /id="projectModal" role="dialog"/);

  for (const key of uniqueKeys) {
    assert.match(html, new RegExp(`${key}: \\{`), `missing modal data for ${key}`);
  }
});

test('theme and motion behavior are progressive and persistent', () => {
  assert.match(html, /const themeStorageKey = 'nexus-theme'/);
  assert.match(html, /localStorage\.setItem\(themeStorageKey, theme\)/);
  assert.match(html, /aria-pressed/);
  assert.match(html, /prefers-reduced-motion: reduce/);
  assert.equal(countMatches(/requestAnimationFrame\(/g), 1, 'animations should go through nextFrame');
});

test('project brief builder renders user input as text', () => {
  assert.match(html, /id="briefForm"/);
  assert.match(html, /function buildBrief/);
  assert.match(html, /document\.createTextNode\(buildBrief\(\)\)/);
  assert.match(html, /document\.createTextNode\(brief\)/);
});
