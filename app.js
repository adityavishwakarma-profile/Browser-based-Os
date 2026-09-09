const OSState = {
  windows: {},      
  activeWindowId: null,
  nextZIndex: 10,
  nextWindowId: 1,
};
const AppRegistry = {
  about: {
    title: "About AdityaOS",
    width: 346,
    height: 225,
    render(bodyEl) {
      bodyEl.classList.add("about-body");
      bodyEl.innerHTML = `
        <p><span class="label">System:</span> AdityaOS</p>
        <p><span class="label">Version:</span> 0.1.0 (Phase 1)</p>
        <p><span class="label">Platform:</span> Web</p>
        <p><span class="label">Note:</span> This window exists to test open, close, minimize, maximize, drag, 
        and resize. Real applications arrive when the developer will decide.</p> `;
    },
  },
  notepad: {
    title: "Notepad",
    width: 440,
    height: 400,
    render(bodyEl) {
      bodyEl.classList.add("notepad-body");
      const textarea = document.createElement("textarea");
      textarea.placeholder = "Type here — not saved yet (User lands into Desktop Area).";
      bodyEl.appendChild(textarea);
    },
  },
  snake: {
    title: "Snake",
    width: 340,
    height: 400,
    render(bodyEl, windowId) {
      bodyEl.classList.add("snake-body");
      const COLS = 18;
      const ROWS = 18;
      const CELL = 14;
      bodyEl.innerHTML = `
        <div class="game-hud">
          <span class="game-score">Score: <b>0</b></span>
          <button class="game-restart">Restart</button>
        </div>
        <canvas width="${COLS * CELL}" height="${ROWS * CELL}"></canvas>
        <p class="game-hint">Arrow keys or WASD. Click the board first.</p>
      `;
      const canvas = bodyEl.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const scoreEl = bodyEl.querySelector(".game-score b");
      const restartBtn = bodyEl.querySelector(".game-restart");
      let snake, dir, nextDir, food, score, alive, loopId;
      function randomFood() {
        let pos;
        do {
          pos = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS),
          };
        } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
        return pos;
      }
      function reset() {
        snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
        dir = { x: 1, y: 0 };
        nextDir = dir;
        score = 0;
        alive = true;
        food = randomFood();
        scoreEl.textContent = score;
        draw();
      }
      function tick() {
        if (!alive) return;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
 
        const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
        const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
 
        if (hitWall || hitSelf) {
          alive = false;
          draw();
          return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score += 10;
          scoreEl.textContent = score;
          food = randomFood();
        } else {
          snake.pop();
        }
        draw();
      }
 
      function draw() {
        ctx.fillStyle = "#d20808";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
 
        ctx.fillStyle = "#1ae0e0";
        ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 1, CELL - 1);
 
        snake.forEach((seg, i) => {
          ctx.fillStyle = i === 0 ? "#7c90ff" : "#4d5b99";
          ctx.fillRect(seg.x * CELL, seg.y * CELL, CELL - 1, CELL - 1);
        });
 
        if (!alive) {
          ctx.fillStyle = "rgba(20, 22, 27, 0.75)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#e7e9f0";
          ctx.font = "13px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Game over — click Restart", canvas.width / 2, canvas.height / 2);
        }
      }
      function onKeyDown(e) {
        if (OSState.activeWindowId !== windowId) return;
        const key = e.key.toLowerCase();
        const map = {
          arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
          arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
          arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
          arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
        };
        const wanted = map[key];
        if (!wanted) return;
        e.preventDefault();
        // Prevent reversing directly into yourself.
        if (wanted.x === -dir.x && wanted.y === -dir.y) return;
        nextDir = wanted;
      }
      document.addEventListener("keydown", onKeyDown);
      restartBtn.addEventListener("click", reset);
      reset();
      loopId = setInterval(tick, 130);
      return () => {
        clearInterval(loopId);
        document.removeEventListener("keydown", onKeyDown);
      };
    },
  },
  Ox: {
    title: "OX game",
    width: 300,
    height: 360,
    render(bodyEl) {
      bodyEl.classList.add("Ox game-body");
      bodyEl.innerHTML = `<p class="game-hint">You're X. The computer plays O.</p>
        <div class="ttt-board"></div>
        <div class="ttt-status"></div>
        <button class="game-restart">Restart</button>
      `;const boardEl = bodyEl.querySelector(".ttt-board");
      const statusEl = bodyEl.querySelector(".ttt-status");
      const restartBtn = bodyEl.querySelector(".game-restart");
      const LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      let cells, over;
      function checkWinner(board) {
        for (const [a, b, c] of LINES) {
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
          }
        }
        return board.every(Boolean) ? "draw" : null;
      }
      function computerMove() {
        const open = cells.map((v, i) => (v ? null : i)).filter((v) => v !== null);
        if (!open.length) return;
        const pick = open[Math.floor(Math.random() * open.length)];
        cells[pick] = "O";
      }
      function render() {
        boardEl.innerHTML = "";
        cells.forEach((val, i) => {
          const cellBtn = document.createElement("button");
          cellBtn.className = "ttt-cell";
          cellBtn.textContent = val || "";
          cellBtn.disabled = Boolean(val) || over;
          cellBtn.addEventListener("click", () => {
            cells[i] = "X";
            const winner = checkWinner(cells);
            if (winner) {
              finish(winner);
              return;
            }
            computerMove();
            const winner2 = checkWinner(cells);
            if (winner2) {
              finish(winner2);
              return;
            }
            render();
          });
          boardEl.appendChild(cellBtn);
        });
        statusEl.textContent = over ? statusEl.textContent : "Your move.";
      }
      function finish(winner) {
        over = true;
        statusEl.textContent =
          winner === "draw" ? "Draw." : winner === "X" ? "You win!" : "Computer wins.";
        render();
      }
      function reset() {
        cells = Array(9).fill(null);
        over = false;
        render();
      }
      restartBtn.addEventListener("click", reset);
      reset();
    },
  },
};
const WindowManager = (() => {
  const layer = document.getElementById("window-layer");
  const taskbarItems = document.getElementById("taskbar-items");
  function createWindow({ appId, title, width = 400, height = 280 }) {
    const id = "win-" + OSState.nextWindowId++;
    const winEl = document.createElement("div");
    winEl.className = "os-window";
    winEl.dataset.windowId = id;
    winEl.style.width = width + "px";
    winEl.style.height = height + "px";
    const offset = (OSState.nextWindowId % 6) * 24;
    winEl.style.left = 60 + offset + "px";
    winEl.style.top = 40 + offset + "px";
    winEl.innerHTML = `
      <div class="os-window-titlebar">
        <span class="os-window-title"></span>
        <div class="os-window-controls">
          <button class="os-window-minimize" title="Minimize">&#8211;</button>
          <button class="os-window-maximize" title="Maximize">&#9633;</button>
          <button class="os-window-close" title="Close">&times;</button>
        </div>
      </div>
      <div class="os-window-body"></div>
      <div class="os-window-resize-handle"></div>
    `;
    winEl.querySelector(".os-window-title").textContent = title;
    layer.appendChild(winEl);
    OSState.windows[id] = {
      appId,
      title,
      minimized: false,
      maximized: false,
      zIndex: OSState.nextZIndex++,
    };
    winEl.style.zIndex = OSState.windows[id].zIndex;
    const bodyEl = winEl.querySelector(".os-window-body");
    const app = AppRegistry[appId];
    if (app && typeof app.render === "function") {
      const cleanup = app.render(bodyEl, id);
      if (typeof cleanup === "function") {
        OSState.windows[id].cleanup = cleanup;
      }
    }
    attachWindowBehavior(winEl, id);
    addTaskbarItem(id, title);
    focusWindow(id);
    return id;
  }
  function attachWindowBehavior(winEl, id) {
    winEl.addEventListener("mousedown", () => focusWindow(id));
    winEl.querySelector(".os-window-close").addEventListener("click", (e) => {
      e.stopPropagation();
      closeWindow(id);
    });
    winEl.querySelector(".os-window-minimize").addEventListener("click", (e) => {
      e.stopPropagation();
      minimizeWindow(id);
    });
    winEl.querySelector(".os-window-maximize").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMaximize(id);
    });
    const titlebar = winEl.querySelector(".os-window-titlebar");
    titlebar.addEventListener("mousedown", (e) => {
      if (e.target.closest(".os-window-controls")) return;
      if (OSState.windows[id].maximized) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = winEl.getBoundingClientRect();
      const parentRect = layer.getBoundingClientRect();
      const startLeft = rect.left - parentRect.left;
      const startTop = rect.top - parentRect.top;
      function onMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        winEl.style.left = startLeft + dx + "px";
        winEl.style.top = Math.max(0, startTop + dy) + "px";
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
    const handle = winEl.querySelector(".os-window-resize-handle");
    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      if (OSState.windows[id].maximized) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = winEl.offsetWidth;
      const startHeight = winEl.offsetHeight;
      function onMove(moveEvent) {
        const dw = moveEvent.clientX - startX;
        const dh = moveEvent.clientY - startY;
        winEl.style.width = Math.max(260, startWidth + dw) + "px";
        winEl.style.height = Math.max(160, startHeight + dh) + "px";
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
    titlebar.addEventListener("dblclick", (e) => {
      if (e.target.closest(".os-window-controls")) return;
      toggleMaximize(id);
    });
  }
  function getWindowEl(id) {
    return layer.querySelector(`[data-window-id="${id}"]`);
  }
  function focusWindow(id) {
    if (OSState.windows[id]?.minimized) return;
    OSState.activeWindowId = id;
    OSState.windows[id].zIndex = OSState.nextZIndex++;
    Object.keys(OSState.windows).forEach((wid) => {
      const el = getWindowEl(wid);
      if (!el) return;
      el.classList.toggle("is-active", wid === id);
      el.style.zIndex = OSState.windows[wid].zIndex;
    });
    updateTaskbarActiveState();
  }
  function closeWindow(id) {
    const state = OSState.windows[id];
    if (state?.cleanup) {
      try {
        state.cleanup();
      } catch (err) {
        console.error(`BrowserOS: cleanup failed for window ${id}:`, err);
      }
    }
    const el = getWindowEl(id);
    if (el) el.remove();
    delete OSState.windows[id];
    removeTaskbarItem(id);
 
    if (OSState.activeWindowId === id) {
      OSState.activeWindowId = null;
      // Focus the most recently used remaining window, if any.
      const remaining = Object.entries(OSState.windows).sort(
        (a, b) => b[1].zIndex - a[1].zIndex
      );
      if (remaining.length) focusWindow(remaining[0][0]);
    }
  }
 
  function minimizeWindow(id) {
    const el = getWindowEl(id);
    OSState.windows[id].minimized = true;
    el.classList.add("is-minimized");
    if (OSState.activeWindowId === id) OSState.activeWindowId = null;
    updateTaskbarActiveState();
  }
  function restoreWindow(id) {
    const el = getWindowEl(id);
    OSState.windows[id].minimized = false;
    el.classList.remove("is-minimized");
    focusWindow(id);
  }
  function toggleMaximize(id) {
    const el = getWindowEl(id);
    const state = OSState.windows[id];
    state.maximized = !state.maximized;
    el.classList.toggle("is-maximized", state.maximized);
    focusWindow(id);
  }
  function addTaskbarItem(id, title) {
    const btn = document.createElement("button");
    btn.className = "taskbar-item";
    btn.dataset.windowId = id;
    btn.textContent = title;
    btn.addEventListener("click", () => {
      const state = OSState.windows[id];
      if (state.minimized) {
        restoreWindow(id);
      } else if (OSState.activeWindowId === id) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    });
    taskbarItems.appendChild(btn);
  }
 
  function removeTaskbarItem(id) {
    const btn = taskbarItems.querySelector(`[data-window-id="${id}"]`);
    if (btn) btn.remove();
  }
 
  function updateTaskbarActiveState() {
    taskbarItems.querySelectorAll(".taskbar-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.windowId === OSState.activeWindowId);
    });
  }
 
  return { createWindow, closeWindow, minimizeWindow, restoreWindow, toggleMaximize };
})();
function launchApp(appId) {
  const app = AppRegistry[appId];
  if (!app) {
    console.error(`BrowserOS: no app registered for "${appId}"`);
    return;
  }
  WindowManager.createWindow({
    appId,
    title: app.title,
    width: app.width,
    height: app.height,
  });
}
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("dblclick", () => launchApp(icon.dataset.app));
  let clickTimer = null;
  icon.addEventListener("click", () => {
    if (clickTimer) return;
    clickTimer = setTimeout(() => {
      clickTimer = null;
    }, 350);
  });
});
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
function openStartMenu() {
  startMenu.hidden = false;
  startButton.classList.add("is-open");
  document.getElementById("start-search").focus();
}
function closeStartMenu() {
  startMenu.hidden = true;
  startButton.classList.remove("is-open");
}
startButton.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.hidden ? openStartMenu() : closeStartMenu();
});
document.addEventListener("click", (e) => {
  if (!startMenu.hidden && !startMenu.contains(e.target) && e.target !== startButton) {
    closeStartMenu();
  }
});
document.querySelectorAll(".start-menu-app").forEach((item) => {
  item.addEventListener("click", () => {
    launchApp(item.dataset.app);
    closeStartMenu();
  });
});
document.getElementById("start-search").addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();
  document.querySelectorAll(".start-menu-app").forEach((item) => {
    const label = item.textContent.trim().toLowerCase();
    item.style.display = label.includes(query) ? "flex" : "none";
  });
});
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("clock").textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 1000 * 10);
function runBootSequence() {
  const fill = document.getElementById("boot-bar-fill");
  const percentLabel = document.getElementById("boot-percent");
  const bootScreen = document.getElementById("boot-screen");
  const desktop = document.getElementById("desktop");
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 22 + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        bootScreen.classList.add("boot-hide");
        desktop.hidden = false;
        setTimeout(() => bootScreen.remove(), 400);
      }, 200);
    }
    fill.style.width = progress + "%";
    percentLabel.textContent = Math.floor(progress) + "%";
  }, 140);
}
window.addEventListener("error", (e) => {
  console.error("AdityaOS caught an unhandled error: Isse koi bhi chedkani mat karo let developer to handle it", e.error || e.message);
});
runBootSequence();