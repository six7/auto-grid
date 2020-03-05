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

getSelectionDimension();

figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  console.log("type", msg.type);
  if (msg.type === "place") {
    const { rows, columns, gap } = msg;
    console.log({ rows, columns, gap })
    const {selection} = figma.currentPage
    const node = selection[0]
    const frame = figma.createFrame()
    frame.layoutMode = "HORIZONTAL";
    frame.appendChild(node)
    for(var counter:number = 1; counter < columns; counter++) {
      console.log({counter})
      let copy = node.clone();
      frame.appendChild(copy)
    }
    for(var counter:number = 1; counter < rows; counter++) {
      let copy = frame.clone();
      frame.parent.appendChild(copy)
    }
    return;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
