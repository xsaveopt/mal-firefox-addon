function getIdFromUrl(url, type) {
  const regex = new RegExp(`/${type}/(\\d+)`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

function createDeleteButton(id, type) {
  const button = document.createElement("a");
  button.href = `https://myanimelist.net/ownlist/${type}/${id}/delete`;
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
  button.className = "mal-delete-extension-btn";

  button.addEventListener("click", async (e) => {
    e.preventDefault();

    const originalText = button.innerText;
    button.innerText = "[Deleting...]";
    button.style.color = "#999";

    try {
      const csrfToken = document.querySelector(
        'meta[name="csrf_token"]',
      )?.content;
      const headers = {};
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch(button.href, {
        method: "POST",
        headers: headers,
      });

      if (response.ok) {
        const row = button.closest("tr") || button.closest(".list-item");
        if (row) {
          row.style.transition = "opacity 0.5s";
          row.style.opacity = "0";
          setTimeout(() => row.remove(), 500);
        }
      } else {
        alert("Request failed with status: " + response.status);
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

function getListType() {
  const url = window.location.href;
  if (url.includes("/mangalist/")) return "manga";
  if (url.includes("/animelist/")) return "anime";
  return null;
}

function processList() {
  const listType = getListType();

  const rows = document.querySelectorAll("tr.list-table-data, .list-item");

  rows.forEach((row) => {
    if (row.querySelector(".mal-delete-extension-btn")) return;

    let id = null;
    let type = null;

    const findId = (preferredType) => {
      const editLinkSelector = `a[href*="/ownlist/${preferredType}/"]`;
      const editLink = row.querySelector(editLinkSelector);
      if (editLink) {
        const regex = new RegExp(`\/ownlist\/${preferredType}\/(\\d+)`);
        const idMatch = editLink.href.match(regex);
        if (idMatch) return { id: idMatch[1], type: preferredType };
      }

      const typeLinkSelector = `a[href*="/${preferredType}/"]`;
      const links = row.querySelectorAll(typeLinkSelector);
      for (const link of links) {
        const foundId = getIdFromUrl(link.href, preferredType);
        if (foundId) return { id: foundId, type: preferredType };
      }
      return null;
    };

    let result = null;
    if (listType === "manga") {
      result = findId("manga");
      if (!result) result = findId("anime");
    } else if (listType === "anime") {
      result = findId("anime");
      if (!result) result = findId("manga");
    } else {
      result = findId("anime") || findId("manga");
    }

    if (result) {
      id = result.id;
      type = result.type;
    }

    if (id && type) {
      const btn = createDeleteButton(id, type);

      if (row.tagName === "TR") {
        const lastCell = row.cells[row.cells.length - 1];
        if (lastCell) {
          lastCell.appendChild(btn);
        }
      } else {
        const computedStyle = window.getComputedStyle(row);
        if (computedStyle.position === "static") {
          row.style.position = "relative";
        }

        btn.style.position = "absolute";
        btn.style.right = "10px";
        btn.style.top = "50%";
        btn.style.transform = "translateY(-50%)";
        btn.style.zIndex = "10";

        row.appendChild(btn);
      }
    }
  });
}

processList();

const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      shouldProcess = true;
      break;
    }
  }
  if (shouldProcess) {
    processList();
  }
});

const listContainer = document.querySelector(".list-block") || document.body;
if (listContainer) {
  observer.observe(listContainer, { childList: true, subtree: true });
}
