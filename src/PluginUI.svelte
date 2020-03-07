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
  var rowCount = 2;
  var columnCount = 2;
  var cellPadding = 8;
  var shouldAutoFlow = false;
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
        shouldAutoFlow = event.data.pluginMessage.values.shouldAutoFlow;
      }
    } else if (event.data.pluginMessage.type === "noselection") {
      disabled = true;
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
    <div class="flex row">
      <div class="flex column">
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
        <Switch
          bind:checked={shouldAutoFlow}
          bind:value={shouldAutoFlow}
          on:change={updateValues}>
          Autoflow
        </Switch>
        <!-- <Switch
          bind:checked={shouldRemoveOverflow}
          bind:value={shouldRemoveOverflow}
          on:change={updateValues}>
          Remove overflow
        </Switch> -->

        <div class="flex">
          <Button class="mr-xxsmall" on:click={placeAction}>Create Grid</Button>
          <Button variant="secondary" on:click={updateValues}>Update</Button>
        </div>
      </div>
      <div class="flex p-large" />
    </div>
  </fieldset>
</div>
