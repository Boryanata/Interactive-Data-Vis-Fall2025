// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Interactive Data Visualization (Fall 2025)",
  theme: "light",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "Lab 0: Getting Started",
      open: false,
      pages: [
        { name: "Instructions", path: "/lab_0/readme" },
        { name: "Dashboard", path: "/lab_0/index" },
      ],
    },
    {
      name: "Lab 1: Prolific Pollinators",
      open: false,
      pages: [
        { name: "Instructions", path: "/lab_1/readme" },
        { name: "Week 5 Class", path: "/lab_1/week_5" },
        { name: "Week 6 Notes", path: "/lab_1/week_6_notes" },
        { name: "Week 6 Class", path: "/lab_1/week_6_class" },
      ],
    },
    {
      name: "Lab 2: Subway Staffing",
      open: true,
      pages: [
        { name: "Instructions", path: "/lab_2/readme" },
        { name: "Week 7 Notes", path: "/lab_2/week_7_notes" },
        { name: "Week 7 Class", path: "/lab_2/week_7_class" },
        { name: "Playing with AI", path: "/lab_2/playing_with_ai" },
      ],
    },
    {
      name: "Lab 3: Mayoral Mystery",
      open: true,
      pages: [
        { name: "Instructions", path: "/lab_3/readme" },
        { name: "Dashboard", path: "/lab_3/index" },
      ],
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
