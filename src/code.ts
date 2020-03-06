// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 370,
  height: 230
});

figma.on("selectionchange", () => {
  getSelectionDimension();
  reflow();
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

function getSelectionDimension() {
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({ type: "noinstance" });
  } else {
    figma.ui.postMessage({
      type: "selection",
    });
  }
};

function supportsChildren(node: SceneNode):
  node is FrameNode | ComponentNode | InstanceNode | BooleanOperationNode
{
  return node.type === 'FRAME' || node.type === 'GROUP' ||
         node.type === 'COMPONENT' || node.type === 'INSTANCE' ||
         node.type === 'BOOLEAN_OPERATION'
}

function reflow() {
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({ type: "noinstance" });
  } else {
    let childNodes = []
    const gridFrames = figma.currentPage.findAll(n => n.name === "Grid")[0]
    if (!gridFrames) return;
    if (supportsChildren(gridFrames)) {
      // Inside this if statement, selection always has .children property
      let rows = gridFrames.children
      for (const row of rows) {
        if (supportsChildren(row)) {
          for (const child of row.children) {
            childNodes.push(child)
          }
        }
      }
      var rowCounter:number = 0;
      for (var index in rows) {
        const row = rows[index]
        console.log("start of row", index)
        if (supportsChildren(row)) {
          for (rowCounter; rowCounter < 4; rowCounter++) {
            if (childNodes.length) {
              console.log("Appending child to row")
              row.appendChild(childNodes[0])
              childNodes.shift()
              console.log("Removing child node, remaining children:", childNodes.length)
            }
          }
          if (row.children.length === 0) row.remove();
        }
        console.log("end of row", index)
        rowCounter = 0;
      }
    }


    return;
  }
};

getSelectionDimension();

figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  console.log("type", msg.type);


  if (msg.type === "place") {
    const { rows, columns, gap } = msg;
    const selection = figma.currentPage.selection[0]
    if (!selection) { return }
    const parent = selection.parent
    const frame = figma.createFrame()
    frame.layoutMode = "HORIZONTAL";
    frame.counterAxisSizingMode = "AUTO";
    frame.name = "Row"
    frame.itemSpacing = gap;
    frame.appendChild(selection)
    var nodes = []
    for(var counter:number = 1; counter < columns; counter++) {
      let copy = selection.clone();
      frame.appendChild(copy)
    }
    nodes.push(frame)
    for(var counter:number = 1; counter < rows; counter++) {
      let copy = frame.clone();
      frame.parent.appendChild(copy)
      nodes.push(copy)
    }
    figma.currentPage.selection = nodes
    const grid = figma.createFrame()
    grid.layoutMode = "VERTICAL";
    grid.counterAxisSizingMode = "AUTO";
    grid.name = "Grid"
    grid.itemSpacing = gap;

    for(const node of nodes) {
      grid.appendChild(node)
    }
    parent.appendChild(grid)

    figma.currentPage.selection = [grid];
    figma.viewport.scrollAndZoomIntoView([grid])
    return;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
