import { deleteUrl, getIdFromUrl, listTypeFromUrl, type MalType, typeSearchOrder } from "./mal.ts";

const BUTTON_CLASS = "mal-delete-extension-btn";

function createDeleteButton(id: string, type: MalType): HTMLAnchorElement {
  const button = document.createElement("a");
  button.href = deleteUrl(type, id);
  button.innerText = "[Delete]";
  button.title = `Delete this ${type} from your list`;
  button.style.cssText = `
    margin-left: 8px;
    color: #ff0000;
    font-size: 0.85em;
    cursor: pointer;
    text-decoration: none;
    font-family: inherit;
  `;
  button.className = BUTTON_CLASS;

  button.addEventListener("click", async (event) => {
    event.preventDefault();

    const originalText = button.innerText;
    button.innerText = "[Deleting...]";
    button.style.color = "#999";

    try {
      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf_token"]')?.content;
      const headers: Record<string, string> = {};
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch(button.href, { method: "POST", headers });

      if (response.ok) {
        const row = button.closest("tr") ?? button.closest(".list-item");
        if (row instanceof HTMLElement) {
          row.style.transition = "opacity 0.5s";
          row.style.opacity = "0";
          setTimeout(() => row.remove(), 500);
        }
      } else {
        alert(`Request failed with status: ${response.status}`);
        button.innerText = originalText;
        button.style.color = "#ff0000";
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert(`Error deleting ${type}. See console for details.`);
      button.innerText = originalText;
      button.style.color = "#ff0000";
    }
  });

  return button;
}

function findEntry(row: Element, listType: MalType | null): { id: string; type: MalType } | null {
  for (const type of typeSearchOrder(listType)) {
    const editLink = row.querySelector<HTMLAnchorElement>(`a[href*="/ownlist/${type}/"]`);
    if (editLink) {
      const idMatch = editLink.href.match(new RegExp(`/ownlist/${type}/(\\d+)`));
      if (idMatch) {
        return { id: idMatch[1], type };
      }
    }

    const links = row.querySelectorAll<HTMLAnchorElement>(`a[href*="/${type}/"]`);
    for (const link of links) {
      const id = getIdFromUrl(link.href, type);
      if (id) {
        return { id, type };
      }
    }
  }

  return null;
}

function placeButton(row: Element, button: HTMLAnchorElement): void {
  if (row instanceof HTMLTableRowElement) {
    row.cells[row.cells.length - 1]?.appendChild(button);
    return;
  }

  if (row instanceof HTMLElement) {
    if (getComputedStyle(row).position === "static") {
      row.style.position = "relative";
    }
    button.style.position = "absolute";
    button.style.right = "10px";
    button.style.top = "50%";
    button.style.transform = "translateY(-50%)";
    button.style.zIndex = "10";
    row.appendChild(button);
  }
}

function processList(): void {
  const listType = listTypeFromUrl(window.location.href);
  const rows = document.querySelectorAll("tr.list-table-data, .list-item");

  for (const row of rows) {
    if (row.querySelector(`.${BUTTON_CLASS}`)) {
      continue;
    }

    const entry = findEntry(row, listType);
    if (!entry) {
      continue;
    }

    placeButton(row, createDeleteButton(entry.id, entry.type));
  }
}

processList();

const observer = new MutationObserver((mutations) => {
  if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
    processList();
  }
});

const listContainer = document.querySelector(".list-block") ?? document.body;
observer.observe(listContainer, { childList: true, subtree: true });
