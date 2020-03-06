// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 250,
  height: 220
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

var rowCount = 1;
var columnCount = 1;
var cellPadding = 8;
var shouldAutoFlow = false;
var shouldRemoveOverflow = false;

function getSelectionDimension() {
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({ type: "noinstance" });
  } else {
    let pluginValues = fetchPluginData(figma.currentPage.selection[0]);
    if (pluginValues) {
      figma.ui.postMessage({
        type: "selection",
        values: pluginValues
      });
    } else {
      figma.ui.postMessage({
        type: "selection"
      });
    }
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

function updateValues(msg) {
  console.log({ msg });
  columnCount = msg.columnCount;
  rowCount = msg.rowCount;
  cellPadding = msg.cellPadding;
  shouldAutoFlow = msg.shouldAutoFlow;
  shouldRemoveOverflow = msg.shouldRemoveOverflow;
}

function fetchPluginData(node) {
  let previousValues = node.getPluginData("values");
  if (previousValues) {
    let parsedValues = JSON.parse(previousValues);
    console.log({ parsedValues });
    updateValues(parsedValues);
    return parsedValues;
  }
}

function updatePluginData(node) {
  node.setPluginData(
    "values",
    JSON.stringify({
      rowCount,
      columnCount,
      cellPadding,
      shouldAutoFlow
    })
  );
}

function reflow() {
  let childNodes = [];
  let grid;
  // const selection = figma.currentPage.selection;
  // const grid = selection.filter(n => n.name === "Grid")[0];
  let selection = figma.currentPage.selection[0];
    let gridNodes = figma.currentPage.findAll(n => n.name === "Grid");
    console.log({gridNodes})
    for (const gridItem of gridNodes) {
      if (supportsChildren(gridItem)) {
        let hit = gridItem.findAll(n => n.id === selection.id)
        if (hit) {
          grid = gridItem;
        } else {
          grid = undefined;
        }
      }
    }
  // Todo: Only set plugin values on the root grid item
  // Todo: Only perform reflow on layers that have AutoGrid as a parent node
  if (!grid) return;
  updatePluginData(grid);
  grid.setRelaunchData({ edit: `${rowCount} x ${columnCount}` });
  if (supportsChildren(grid)) {
    if (grid.type === "FRAME") {
      grid.itemSpacing = cellPadding;
    }
    let rows = grid.children;
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
        const newRow = createRow();
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

function createRow() {
  const frame = figma.createFrame();
  frame.layoutMode = "HORIZONTAL";
  frame.counterAxisSizingMode = "AUTO";
  frame.name = "Row";
  frame.itemSpacing = cellPadding;
  frame.backgrounds = [];
  return frame;
}

function createGrid() {
  const grid = figma.createFrame();
  grid.layoutMode = "VERTICAL";
  grid.counterAxisSizingMode = "AUTO";
  grid.name = "Grid";
  grid.itemSpacing = cellPadding;
  grid.backgrounds = [];
  grid.setRelaunchData({ edit: "Edit this trapezoid with Shaper", open: "" });
  return grid;
}

figma.on("selectionchange", () => {
  getSelectionDimension();
  if (shouldAutoFlow) {
    reflow();
  }
});

figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  if (msg.type === "initiate") {
    console.log("Initiated");
    getSelectionDimension();

    if (shouldAutoFlow) {
      reflow();
    }
    return;
  }

  if (msg.type === "update") {
    updateValues(msg);
    const selection = figma.currentPage.selection[0];
    if (!selection) {
      return;
    }
    if (shouldAutoFlow) {
      reflow();
    }
    return;
  }

  if (msg.type === "place") {
    updateValues(msg);
    const selection = figma.currentPage.selection[0];
    if (!selection) {
      return;
    }
    const parent = selection.parent;
    const frame = createRow();
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
    const grid = createGrid();

    for (const node of nodes) {
      grid.appendChild(node);
    }
    parent.appendChild(grid);
    updatePluginData(grid);
    grid.setRelaunchData({ edit: `${rowCount} x ${columnCount}` });

    figma.currentPage.selection = [grid];
    figma.viewport.scrollAndZoomIntoView([grid]);
    return;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
