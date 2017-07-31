# ember-test-examples

This Repo has some failing tests (denoted with `(expected to fail)`). It also includes passing tests. Not all tests follow best practices, and should have a comment indicating such. The goal of this repo is to highlight good and bad practices for testing in Ember.

### Goals

- No side effects from tests
- Tests run fast, deterministically, and in any order

#### How to achieve these

- No scheduled work remains scheduled (in or out of the Ember-runloop)
- *Deliberately* wait on timeouts, or use environment to configure them
- Get non-Ember-runloop work into it
- Use wait only where necessary
- Unit tests must test single units (stub services)
- Integration tests should use stubs for external requests only (ajax, etc)

#### Why this matters

Tests often seem to pass and leave no trace, until they're bundled into a larger test suite. Sometimes, they'll even pass until they're run in a different order, or another test is added just before or after them. It's important to use best practices in writing your tests to be absolutely sure that your test is not leaving side effects from asynchronous work. Otherwise, it can be a time consuming and frustrating process to track down the root cause of side effects.
