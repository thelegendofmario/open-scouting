# Client Systems

This page documents how to use several of the systems and utilities that are built into Open Scouting's client for some common use cases

## Sending notifications
Notifications are shown next to the menu and can be used to provide the user with some information if an action succeeds or fails

Send a notification using a JavaScript event, on any page that uses the menu

Parameters for the event details:
- `title` - The title of the notification
- `body` - The body text of the notification
- `icon` - The icon to display on the notification, as a Phosphor Icon, minus the `ph-` part

```js
window.dispatchEvent(
    new CustomEvent("scouting_notification", {
        detail: {
            title: "Event autofilled",
            body: "Autofilled the event and year from the provided link data",
            icon: "lightning",
        },
    }),
);
```

## Using common styles
There's several common UI styles located in [`styles.css`](/scouting/static/main/src/styles.css)

- `ui_button` - A large button
- `ui_button_icon` - A button the same height, but only wide enough to fit an icon
- `ui_button_small` - A much smaller button, useful for groups of more buttons or chips
- `ui_input` - Styles for a text input, drop down, or multiple choice box
- `ui_checkbox` - Styles for checkboxes

Using these styles is as simple as using them as a tailwind utility class

```html
<!-- Note the 'ui_button' -->
<button class="ui_button w-full" @click="sign_in()">
    <i class="ph-bold ph-user-circle"></i> Sign In
</button>
```

## Showing dialogs
Dialogs cover the entire page's content and are used to ask the user a question or display urgent information

Create a dialog using a JavaScript event, on any page that has the dialog component available

Parameters for the event details:
- `event_name` - Used later to receive events from buttons clicked for a specific dialog
- `title` - The title text of the dialog
- `body` - The body text of the dialog
- `buttons` - An array of the buttons to display on the dialog
    - Buttons take several parameters:
        - `type` - Can be `confirm`, `cancel`, or `close`. Returns different events based on the type
        - `icon` - The CSS class to apply to show an icon
        - `text` - The text to show on the button

```js
// Showing a dialog
window.dispatchEvent(
    new CustomEvent("dialog_show", {
        detail: {
            event_name: "sign_out",
            title: "Signing out will clear page cache",
            body: "You're currently offline. Signing out will reset any cached pages to make sure your user is actually signed in. Those pages will not be able to be cached again until you're online, so the site may not work properly if you proceed. Are you sure you want to sign out?",
            buttons: [
                { type: "confirm", icon: "ph-bold ph-check", text: "Sign out" },
                { type: "cancel", icon: "ph-bold ph-x", text: "Not now" },
            ],
        },
    }),
);
```

Later, to react on a button in the dialog getting pressed, you'll need to capture one of three events based on the button type you chose. The event will either be `dialog_confirm`, `dialog_cancel` or `dialog_close`.

These events returns an `event_name` in the details, which can be used to check for what dialog that button was pressed on

> ![NOTE]
> Ensure you don't call `event.stopImmeadiatePropogation();` until you're sure you wish to react on that event. If multiple components use dialogs, only one component might get the `dialog_confirm` event.

```js
// Reacting to the dialog_confirm event, and checking that it's of type sign_out before doing anything with that event
window.addEventListener("dialog_confirm", (event) => {
    const { event_name } = event.detail;

    if (event_name === "sign_out") {
        event.stopImmediatePropagation();

        localStorage.setItem("offline_manual", false);
        window.dispatchEvent(new CustomEvent("sw_update_offline_manual"));

        this.sign_out();
    }
});
```
