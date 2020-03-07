// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 250,
  height: 170
});

var shouldAutoFlow = true;

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

function sendPluginValues(node) {
  let pluginValues = fetchPluginData(node);
  console.log({ pluginValues });
  if (pluginValues) {
    notifySelection(node.id, pluginValues);
  } else {
    notifySelection();
  }
}

function supportsChildren(
  node: SceneNode
): node is FrameNode | ComponentNode | InstanceNode | BooleanOperationNode {
  return (
    node.type === "FRAME" ||
    node.type === "GROUP" ||
    node.type === "COMPONENT" ||
    node.type === "INSTANCE" ||
    node.type === "BOOLEAN_OPERATION"
  );
}

function fetchPluginData(node) {
  let previousValues = node.getPluginData("values");
  if (!previousValues) return;
  return JSON.parse(previousValues);
}

function updatePluginData(node, values) {
  const { rowCount, columnCount, cellPadding } = values;
  node.setPluginData(
    "values",
    JSON.stringify({
      rowCount,
      columnCount,
      cellPadding
    })
  );
}

function updateGrids() {
  if (!shouldAutoFlow) return;

  let gridNodes = figma.currentPage.findAll(n => {
    if (supportsChildren(n)) {
      let pluginData = n.getPluginData("values");
      if (pluginData && n.children.length) return true;
    }
  });
  if (!gridNodes.length) {
    return;
  }
  for (const grid of gridNodes) {
    reflow(grid, fetchPluginData(grid));
  }
}

function findParent(selection) {
  let parent;
  function traverse(node) {
    if (node.type !== "DOCUMENT") {
      if (node.getPluginData("values")) {
        parent = node;
        return;
      }
      traverse(node.parent);
    } else {
      return;
    }
  }
  traverse(selection);
  return parent;
}

function reflow(grid, values) {
  const { cellPadding, rowCount, columnCount } = values;
  grid.setRelaunchData({
    edit: `${rowCount} x ${columnCount}`,
    run: `${rowCount} x ${columnCount}`
  });
  let shouldRemoveOverflow = false;
  if (supportsChildren(grid)) {
    if ("itemSpacing" in grid) {
      grid.itemSpacing = cellPadding;
    }
    let rows = grid.findChildren(n => n.name === "Row");
    let childNodes = [];
    for (const row of rows) {
      if (supportsChildren(row)) {
        for (const child of row.children) {
          childNodes.push(child);
        }
      }
    }

    if (shouldRemoveOverflow) {
      childNodes.splice(0, rowCount * columnCount);
    }
    var rowCounter: number = 0;
    for (var index in rows) {
      const row = rows[index];
      if (row.type === "FRAME") {
        row.itemSpacing = cellPadding;
      }
      if (supportsChildren(row)) {
        for (rowCounter; rowCounter < columnCount; rowCounter++) {
          if (childNodes.length) {
            row.appendChild(childNodes[0]);
            childNodes.shift();
          }
        }
        rowCounter = 0;
      }
    }

    if (childNodes.length > 0) {
      var i,
        j,
        temparray,
        chunk = columnCount;
      for (i = 0, j = childNodes.length; i < j; i += chunk) {
        temparray = childNodes.slice(i, i + chunk);
        const newRow = createRow(values);
        temparray.map(node => {
          newRow.appendChild(node);
        });
        grid.appendChild(newRow);
      }
    }

    if (shouldRemoveOverflow) {
      for (const child of childNodes) {
        child.remove();
      }
    }

    for (const row of rows) {
      if (supportsChildren(row)) {
        if (row.children.length === 0) row.remove();
      }
    }
  }

  return;
}

function createRow(values) {
  const { cellPadding } = values;
  const frame = figma.createFrame();
  frame.layoutMode = "HORIZONTAL";
  frame.counterAxisSizingMode = "AUTO";
  frame.name = "Row";
  frame.clipsContent = false;
  frame.itemSpacing = cellPadding;
  frame.backgrounds = [];
  return frame;
}

function createGrid(values) {
  const { cellPadding } = values;
  const grid = figma.createFrame();
  grid.layoutMode = "VERTICAL";
  grid.counterAxisSizingMode = "AUTO";
  grid.name = "Grid";
  grid.clipsContent = false;
  grid.itemSpacing = cellPadding;
  grid.backgrounds = [];
  return grid;
}

function notifyNoSelection() {
  figma.ui.postMessage({
    type: "noselection"
  });
}

function notifySelection(node = undefined, values = undefined) {
  console.log({ values, node });
  figma.ui.postMessage({
    type: "selection",
    node,
    values
  });
}

function checkSelection(node) {
  console.log("node", node);
}

figma.on("selectionchange", () => {
  console.log("Selection change");
  let node = figma.currentPage.selection[0];
  if (!node) {
    console.log("Got no selection, should we update all grids?");
    notifyNoSelection();
    updateGrids();

    return;
  }
  checkSelection(node);
  let grid = findParent(node);
  if (!grid) {
    notifySelection();
    return;
  }
  sendPluginValues(grid);
  if (!shouldAutoFlow) return;
  reflow(grid, fetchPluginData(grid));
});

figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  if (msg.type === "gotoparent") {
    console.log({msg})
    let node = figma.currentPage.findOne(n => n.id === msg.id);
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
    return;
  }

  if (msg.type === "initiate") {
    let node = figma.currentPage.selection[0];
    if (!node) {
      updateGrids();
      return;
    }
    let grid = findParent(node);
    if (!grid) return;
    sendPluginValues(grid);
    if (!shouldAutoFlow) return;
    reflow(grid, fetchPluginData(grid));
    return;
  }

  if (msg.type === "manualupdate") {
    let node = figma.currentPage.selection[0];
    if (!node) return;
    let grid = findParent(node);
    if (!grid) return;
    updatePluginData(grid, msg);
    reflow(grid, msg);
    return;
  }

  if (msg.type === "update") {
    shouldAutoFlow = msg.shouldAutoFlow;
    let node = figma.currentPage.selection[0];
    if (!node) {
      updateGrids();
      return;
    }
    let grid = findParent(node);
    if (!grid) return;
    updatePluginData(grid, msg);
    console.log({ shouldAutoFlow });
    if (!shouldAutoFlow) return;
    reflow(grid, msg);
    return;
  }

  if (msg.type === "place") {
    const { rowCount, columnCount, cellPadding, shouldAutoFlow } = msg;
    const selection = figma.currentPage.selection[0];
    if (!selection) {
      return;
    }
    const { x, y } = selection;
    const parent = selection.parent;
    const frame = createRow(msg);
    frame.appendChild(selection);
    var nodes = [];
    for (var counter: number = 1; counter < columnCount; counter++) {
      let copy = selection.clone();
      frame.appendChild(copy);
    }
    // Todo: Remove all this and move to reflow, or possibly extract the reflow logic to another one
    nodes.push(frame);
    for (var counter: number = 1; counter < rowCount; counter++) {
      let copy = frame.clone();
      frame.parent.appendChild(copy);
      nodes.push(copy);
    }
    figma.currentPage.selection = nodes;
    const grid = createGrid(msg);

    for (const node of nodes) {
      grid.appendChild(node);
    }
    grid.x = x;
    grid.y = y;
    parent.appendChild(grid);
    updatePluginData(grid, msg);
    grid.setRelaunchData({
      edit: `${rowCount} x ${columnCount}`,
      run: `${rowCount} x ${columnCount}`
    });

    figma.currentPage.selection = [grid];
    figma.viewport.scrollAndZoomIntoView([grid]);
    return;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
