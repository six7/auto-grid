<script>
  import { onMount } from "svelte";
  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from "figma-plugin-ds-svelte";
  import Input from "./Input.svelte";

  //import some Svelte Figma UI components
  import { Button, Label, SelectMenu, Switch } from "figma-plugin-ds-svelte";

  var disabled = false;
  var rows = 2;
  var columns = 2;
  var gap = 8;
  var autoflow = false;
  var removeoverflow = false;

  //this is a reactive variable that will return false when a value is selected from
  //the select menu, its value is bound to the primary buttons disabled prop

  $: values = {
    rows: Number(rows),
    columns: Number(columns),
    gap: Number(gap),
    autoflow: Boolean(autoflow),
    removeoverflow: Boolean(removeoverflow)
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
    console.log("af", values.autoflow);
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
        <Input
          name="rows"
          iconText="S"
          bind:value={rows}
          on:change={updateValues}
          class="mb-xxsmall" />
        <Label>columns</Label>
        <Input
          name="columns"
          iconText="S"
          bind:value={columns}
          on:change={updateValues}
          class="mb-xxsmall" />
        <Label>Gap</Label>
        <Input
          name="gap"
          iconText="S"
          bind:value={gap}
          on:change={updateValues}
          class="mb-xxsmall" />
        <Switch
          bind:checked={autoflow}
          bind:value={autoflow}
          on:change={updateValues}>
          Autoflow
        </Switch>
        <Switch
          bind:checked={removeoverflow}
          bind:value={removeoverflow}
          on:change={updateValues}>
          Remove overflow
        </Switch>

        <button on:click={placeAction}>Create Grid</button>
        <button on:click={updateValues}>Update</button>
      </div>
      <div class="flex p-large" />
    </div>
  </fieldset>
</div>
