// The window on the front page answers the keys it shows: up and down move
// the cursor, Space marks a file and moves on, left and right switch panels.
// Tab is left alone, so the keyboard can always leave the window.
(() => {
  const demo = document.getElementById("demo");
  if (!demo) return;

  const panels = [...demo.querySelectorAll(".panel")];
  const status = demo.querySelector(".status");
  let active = 0;

  const rows = (panel) => [...panel.querySelectorAll("tbody tr")];
  const cursorIndex = (panel) => rows(panel).findIndex((row) => row.classList.contains("cursor"));

  function grouped(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function updateStatus() {
    const files = rows(panels[active]).filter((row) => row.dataset.size);
    const marked = files.filter((row) => row.classList.contains("marked"));
    const bytes = marked.reduce((sum, row) => sum + Number(row.dataset.size), 0);
    // The sentence comes from the page, in the page's language.
    const template = status.dataset.template || "{marked} of {files} files marked, {bytes} bytes";
    status.textContent = template
      .replace("{marked}", marked.length)
      .replace("{files}", files.length)
      .replace("{bytes}", grouped(bytes));
  }

  function moveCursor(panel, index) {
    const all = rows(panel);
    const target = Math.max(0, Math.min(all.length - 1, index));
    all.forEach((row, i) => row.classList.toggle("cursor", i === target));
  }

  function activate(index) {
    active = index;
    panels.forEach((panel, i) => panel.classList.toggle("is-active", i === active));
    updateStatus();
  }

  demo.addEventListener("keydown", (event) => {
    const panel = panels[active];
    const index = cursorIndex(panel);
    switch (event.key) {
      case "ArrowDown": moveCursor(panel, index + 1); break;
      case "ArrowUp": moveCursor(panel, index - 1); break;
      case "Home": moveCursor(panel, 0); break;
      case "End": moveCursor(panel, rows(panel).length - 1); break;
      case "ArrowLeft": activate(0); break;
      case "ArrowRight": activate(panels.length - 1); break;
      case " ": {
        const row = rows(panel)[index];
        // Only files here, to keep the status line simple; the program marks
        // folders too (everything but "..").
        if (row && row.dataset.size) row.classList.toggle("marked");
        moveCursor(panel, index + 1);
        updateStatus();
        break;
      }
      default: return;
    }
    event.preventDefault();
  });

  panels.forEach((panel, panelIndex) => {
    panel.addEventListener("click", (event) => {
      const row = event.target.closest("tbody tr");
      activate(panelIndex);
      if (row) moveCursor(panel, rows(panel).indexOf(row));
    });
  });
})();
