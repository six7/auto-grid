<script>
  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import Input from "./Input.svelte";

  //import some Svelte Figma UI components
  import { Button, Label, SelectMenu } from "figma-plugin-ds-svelte";

  var disabled = false;
  var rows = 2;
  var columns = 2;
  var gap = 8;

  //this is a reactive variable that will return false when a value is selected from
  //the select menu, its value is bound to the primary buttons disabled prop

  function placeAction() {
    parent.postMessage(
      {
        pluginMessage: {
          type: "place",
          rows: Number(rows),
          columns: Number(columns),
          gap: Number(gap)
        }
      },
      "*"
    );
  }

  function cancel() {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  }

  onmessage = event => {
    if (event.data.pluginMessage.type === "selection") {
      disabled = false;
    } else if (event.data.pluginMessage.type === "noinstance") {
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
        <Label>Rows</Label>
        <Input name="rows" iconText="S" bind:value={rows} class="mb-xxsmall" />
        <Label>columns</Label>
        <Input name="columns" iconText="S" bind:value={columns} class="mb-xxsmall" />
        <Label>Gap</Label>
        <Input name="gap" iconText="S" bind:value={gap} class="mb-xxsmall" />

        <button on:click={placeAction}>Place</button>

      </div>
      <div class="flex p-large" />
    </div>
  </fieldset>
</div>
