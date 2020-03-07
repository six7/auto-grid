<script>
  import { onMount } from "svelte";
  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import Input from "./Input.svelte";
  import Padding from "./padding.svg";
  import Horizontal from "./horizontal.svg";
  import Vertical from "./vertical.svg";

  //import some Svelte Figma UI components
  import {
    Button,
    Icon,
    Label,
    Type,
    Section,
    SelectMenu,
    Switch
  } from "figma-plugin-ds-svelte";

  var disabled = false;
  var notExisting = true;
  var rowCount = 2;
  var columnCount = 2;
  var cellPadding = 8;
  var shouldAutoFlow = true;
  var shouldRemoveOverflow = false;
  var gridNode = undefined;

  //this is a reactive variable that will return false when a value is selected from
  //the select menu, its value is bound to the primary buttons disabled prop

  $: values = {
    rowCount: Number(rowCount),
    columnCount: Number(columnCount),
    cellPadding: Number(cellPadding),
    shouldAutoFlow: Boolean(shouldAutoFlow),
    shouldRemoveOverflow: Boolean(shouldRemoveOverflow)
  };
  $: updateDisabled = notExisting || shouldAutoFlow;

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

  function goToParent() {
    parent.postMessage(
      { pluginMessage: { type: "gotoparent", id: gridNode } },
      "*"
    );
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
        gridNode = event.data.pluginMessage.node;
        console.log({ gridNode });
        notExisting = false;
      } else {
        gridNode = false;
        notExisting = true;
      }
    } else if (event.data.pluginMessage.type === "noselection") {
      disabled = true;
      gridNode = false;
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
  <div
    class="mb-xxsmall flex justify-content-between align-items-center"
    style="min-height: 25px;">
    {#if gridNode}
      <Type weight="bold" size="small">Found existing AutoGrid</Type>
      <button
        on:click={goToParent}
        class="p-xxxsmall"
        style="border: 0; border-radius: 3px; background: rgba(24, 145, 251,
        0.2)">
        <Type weight="bold">Go to</Type>
      </button>
    {:else if disabled}
      <Type weight="bold" size="small">Select something to start.</Type>
    {:else}
      <Type weight="bold" size="small">Configure your new AutoGrid</Type>
    {/if}
  </div>

  <div class="flex justify-content-between">
    <Input
      {disabled}
      placeholder="Rows"
      name="rowCount"
      iconName={Vertical}
      bind:value={rowCount}
      on:change={updateValues}
      class="mr-xxsmall" />
    <Input
      {disabled}
      placeholder="Columns"
      name="columnCount"
      iconName={Horizontal}
      bind:value={columnCount}
      on:change={updateValues}
      class="mr-xxsmall" />
    <Input
      {disabled}
      placeholder="Padding"
      title="Padding"
      name="cellPadding"
      iconName={Padding}
      bind:value={cellPadding}
      on:change={updateValues} />
  </div>
  <Switch
    class="mt-xxsmall mb-xxsmall"
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
      <Button
        variant="secondary"
        bind:disabled={updateDisabled}
        on:click={manualUpdateValues}>
        Update
      </Button>
    </div>
  </fieldset>
</div>
