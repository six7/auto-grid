<script>
  import { onMount } from "svelte";
  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import Input from "./Input.svelte";
  import {
    Icon,
    IconLayoutGridColumns,
    IconLayoutGridRows,
    IconArrowLeftRight
  } from "figma-plugin-ds-svelte";

  //import some Svelte Figma UI components
  import { Button, Label, SelectMenu, Switch } from "figma-plugin-ds-svelte";

  var disabled = false;
  var notExisting = true;
  var rowCount = 2;
  var columnCount = 2;
  var cellPadding = 8;
  var shouldAutoFlow = true;
  var shouldRemoveOverflow = false;

  //this is a reactive variable that will return false when a value is selected from
  //the select menu, its value is bound to the primary buttons disabled prop

  $: values = {
    rowCount: Number(rowCount),
    columnCount: Number(columnCount),
    cellPadding: Number(cellPadding),
    shouldAutoFlow: Boolean(shouldAutoFlow),
    shouldRemoveOverflow: Boolean(shouldRemoveOverflow)
  };

  function placeAction() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "place",
          ...values
        }
      },
      "*"
    );
  }

  function updateValues() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "update",
          ...values
        }
      },
      "*"
    );
  }
  function manualUpdateValues() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "manualupdate",
          ...values
        }
      },
      "*"
    );
  }

  function initiate() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "initiate",
          ...values
        }
      },
      "*"
    );
  }

  function cancel() {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  }

  onMount(() => {
    initiate();
  });

  onmessage = event => {
    if (event.data.pluginMessage.type === "selection") {
      disabled = false;
      if (event.data.pluginMessage.values) {
        rowCount = event.data.pluginMessage.values.rowCount;
        columnCount = event.data.pluginMessage.values.columnCount;
        cellPadding = event.data.pluginMessage.values.cellPadding;
        notExisting = false;
      } else {
        notExisting = true;
      }
    } else if (event.data.pluginMessage.type === "noselection") {
      disabled = true;
      notExisting = true;
    } else if (event.data.pluginMessage.type === "initiate") {
      shouldAutoFlow = event.data.pluginMessage.values.cellPadding;
    }
  };
</script>

<style>
  /* Add additional global or scoped styles here */
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }
</style>

<div class="wrapper p-xxsmall">
  <fieldset {disabled}>
    <Input
      name="rowCount"
      iconName={IconLayoutGridRows}
      bind:value={rowCount}
      on:change={updateValues}
      class="mb-xxsmall" />
    <Input
      name="columnCount"
      iconName={IconLayoutGridColumns}
      bind:value={columnCount}
      on:change={updateValues}
      class="mb-xxsmall" />
    <Input
      name="cellPadding"
      iconName={IconArrowLeftRight}
      bind:value={cellPadding}
      on:change={updateValues}
      class="mb-xxsmall" />
  </fieldset>
  <Switch
    class="mb-xxsmall"
    bind:checked={shouldAutoFlow}
    bind:value={shouldAutoFlow}
    on:change={updateValues}>
    Auto-Update
  </Switch>
  <!-- <Switch
          bind:checked={shouldRemoveOverflow}
          bind:value={shouldRemoveOverflow}
          on:change={updateValues}>
          Remove overflow
        </Switch> -->
  <fieldset {disabled}>
    <div class="flex">
      <Button class="mr-xxsmall" on:click={placeAction}>Create new Grid</Button>
      <Button variant="secondary" bind:disabled={notExisting} on:click={manualUpdateValues}>Update</Button>
    </div>
  </fieldset>
</div>
