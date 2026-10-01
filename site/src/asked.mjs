// What people asked for, and what was done: the content of the /asked/ page. Edit this file to change the page.
// Newest first. Each entry is written in the site's own words, never the person's: no names, no quoted notes,
// nothing that identifies who asked. `state` is one of "done", "progress", "open" or "declined"; `date` is the
// day the entry last changed; `href` is the page where the result can be seen.
export const ASKED = [
  {
    asked: "Show each department's budget beside what it actually spent",
    state: "done",
    what: "Budget now sets each department’s original budget beside its reported actual spending, with source links and earlier years. Priorities shows the department and program comparisons.",
    date: "2026-09-30",
    href: "/budget/",
  },
  {
    asked: "Make the pattern headings look like something to click",
    state: "done",
    what: "Each pattern's title is now the link to its records, with an arrow. The link to its method sits beside it.",
    date: "2026-09-30",
    href: "/flags/",
  },
  {
    asked: "Say more plainly what the site is",
    state: "done",
    what: "A notice at the top of every page says the site is in beta and its figures are gathered by automated scripts. The foot of every page says that a flag is a question, not a finding.",
    date: "2026-09-30",
    href: "/about/",
  },
];

export const ASKED_STATE = { done: "Done", progress: "In progress", open: "Not started", declined: "Not planned" };
