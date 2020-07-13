class Monologue
{
    displaySelect()
    {
        var j_entries = JournalDirectory.collection.entries.map(x => {return {'name': x.data.name, 'id': x.data._id}})
        var selections = render_template("../templates/journal_select.html", j_entries)
        let d = new Dialog({
            title: "Monologue",
            content: selections,
            buttons: {
             select: {
              icon: '<i class="fas fa-check"></i>',
              label: "Select",
              callback: () => {this.processMonologue($('select[name="journals"]').val())}
             }
            },
            default: "select",
            close: () => {console.log("This always is logged no matter which option is chosen")}
           });
           d.render(true);
    }

    displayMessage(message) {
      if (!this.messageDialog || !this.messageDialog.rendered) {
        this.messageDialog = new Dialog(
          {
            title: "Monologue",
            content: `<p>${message}</p>`,
            buttons: {
              dismiss: {
                icon: '<i class="fas fa-check"></i>',
                label: "Close",
                callback: () => {
                  this.messageDialog = null;
                },
              },
            },
            close: () => {
              this.messageDialog = null;
            },
          },
          { width: 300 }
        ).render(true);
      }
    }

    async processMonologue(journal)
    {
      var monologue = JournalDirectory.collection.entries.find(x => x.data._id == journal).data.content;
      var lines = new DOMParser().parseFromString(monologue, "text/html").querySelector("body").children;
      lines.forEach(x => {
        if(x.outerHTML !== "") // Don't print empty lines
          this.sendMessage(x.outerHTML);
        await this.timer(game.settings.get("monologue", "messageDelay") * 1000)
      });
    }

    sendMessage(message)
    {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: message
        }, { chatBubble: false });
    }

    // Returns a Promise that resolves after "ms" Milliseconds
  timer(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
 
}

Hooks.on('getSceneControlButtons', controls => {
    let control = controls.find(c => c.name === "token");
    if(control == undefined)
        return;

    if (tokenButton) {
        tokenButton.tools.push({
          name: "monologue",
          title: "Monologue",
          icon: "fas fa-comment",
          visible: true,
          onClick: () => {
            if (canvas.tokens.controlled.length === 1) {
                this.displaySelect();
            } else if (canvas.tokens.controlled.length > 1) {
              this.displayMessage(
                game.i18n.localize("monologue.errors.multipleTokens")
              );
            } else {
              this.displayMessage(
                game.i18n.localize("monologue.errors.noToken")
              );
            }
          },
        });
      }
    });

Hooks.once('init', () => {
  game.settings.register("monologue", "messageDelay", {
		name: game.i18n.localize("monologue.messageDelay.name"),
		hint: game.i18n.localize("monologue.messageDelay.hint"),
		scope: "world",
		config: true,
		default: .8,
        type: Number,
        range: {min: 0.0, max: 5.0, step: 0.2}
    });
})