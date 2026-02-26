---
cli_help: |
  Plugin: restaurant-menu

  Description: A plugin for `oshea` to generate elegant, print-ready restaurant menus. It leverages advanced custom handler capabilities to produce a visually formatted menu with a grayscale logo and specific typographical styling.


  Features:
    - **Advanced Custom Handler:** Generates bespoke HTML structures for menu layout, moving beyond `DefaultHandler`.
    - **Grayscale Logo Integration:** Automatically converts and embeds a company logo (e.g., your profile icon) in black and white.
    - **Stylized Typography:** Utilizes custom fonts (Google Fonts: Playfair Display, Open Sans) for titles, headings, and descriptions to achieve a professional, classic menu aesthetic.
    - **Structured Menu Content:** Adapts Markdown content into a structured menu format.
    - Customizable via its own .config.yaml and .css files.

  Expected Front Matter:
    - title: (string) Main title for the menu (e.g., "Farmer's Market Menu").
    - date: (string or date, optional) Date of the menu.
    - footerNote: (string, optional) A small note at the bottom of the menu (e.g., acknowledging suppliers).
    - oshea_plugin: (string) Must be set to `restaurant-menu` for self-activation with example.

  Configuration Notes (restaurant-menu.config.yaml):
    - handler_script: Points to "index.js". This is the custom handler that generates the menu's HTML.
    - pdf_options: Adjust page size (e.g., Letter), margins, etc., as needed for printing.
    - css_files: Points to "restaurant-menu.css". Modify or override this file for custom styling.
    - params.logo_file: (string, optional) Path to the logo image (e.g., `./logo.png`). This path is relative to the plugin's base directory.

  Example Usage (after registration, or for self-activation):
    oshea convert my_document.md --plugin restaurant-menu
---

# `restaurant-menu` Plugin

This plugin provides a customizable template for generating restaurant menus from Markdown.
The example menu is adapted from a previous [Farm-to-fork pop-up](https://brege.org/recipes/menus/)
I used to run.
It showcases advanced `oshea` features, particularly the use of a custom handler for precise HTML generation.

## About This Plugin

* **Functionality**

  Unlike basic templates, this `restaurant-menu` plugin *does not* use the `DefaultHandler`. Instead, its `index.js` contains a custom `RestaurantMenuHandler` class that completely controls the HTML output. This allows for complex layouts, dynamic content integration (like processing and embedding images), and fine-grained control over the final PDF appearance.

  It processes your Markdown menu content, embeds a grayscale logo, and applies sophisticated styling via `restaurant-menu.css` and `restaurant-menu.config.yaml`.

* **Customization**

  * **`restaurant-menu.config.yaml`** -- Adjust `description`, `pdf_options`, `css_files`, `params` (`logo_file`), and other settings.
  * **`restaurant-menu.css`** -- Custom CSS rules to style the document, including colors, spacing, and the two most important elements: **layout** and **fonts**.
  * **`index.js`** -- For highly advanced behavior, modify the `RestaurantMenuHandler` class to implement custom data parsing, dynamic content generation, or alternative HTML structures.
  * **`README.md`** -- Keep this documentation updated as you customize your plugin.

## Getting Started

1.  **Understand the Files**

    | **File** | **Description** |
    |---|---|
    | `restaurant-menu.config.yaml`| Main configuration for your plugin. |
    | `index.js` | The Node.js custom handler script that builds the HTML. |
    | `restaurant-menu.css` | Stylesheet for your plugin. |
    | `README.md` | This file – your plugin's documentation. |
    | `restaurant-menu-example.md` | An example Markdown file demonstrating the plugin's usage. |
    | `logo.jpg` | The example logo image to be used in the menu. |

    Any of these files can be modified to fit your needs. If you are planning on making large scale changes (specifically, to `index.js`), you **should** consider **archetyping** this plugin to create a new, independent version before modifying it.

2.  **Test the Example -- Self-Activation (Lazy-Loading)**

    The generated `restaurant-menu-example.md` is pre-configured to use this plugin directly via its front matter. To test, simply navigate into your new plugin's directory and run:
    ```bash
    oshea restaurant-menu-example.md
    ```
    This works because `oshea` includes "self-activation" logic that automatically detects and loads plugins whose configuration files are co-located with the Markdown file being processed (when specified via front matter).

3.  **Registering the Plugin**

    To use the `restaurant-menu` plugin with *any* Markdown file by its name
    (e.g., `oshea convert another.md --plugin restaurant-menu`),

    **Option A** -- Automatic Registration
    ```bash
    oshea plugin add ./restaurant-menu --name restaurant-menu
    ```
    This assumes you clone the parent repository of this plugin via normal Git methods.

    **Option B** -- Registering via the built-in Collection Manager

    `oshea` can install plugins from GitHub repositories as well:
    ```bash
    oshea collection add https://github.com/brege/oshea-plugins --name brege-plugins
    oshea plugin list brege-plugins --short
    # ...
    # Available (CM)            | restaurant-menu          | brege-plugins/restaurant-menu

    oshea plugin enable brege-plugins/restaurant-menu
    # oshea plugin: Attempting to enable plugin...
    # Plugin Identifier: my-archetypes/my-restaurant-menu
    # Plugin "my-archetypes/my-restaurant-menu" enabled successfully as "my-restaurant-menu".
    # To use this plugin with oshea, invoke it as: oshea convert ... --plugin my-restaurant-menu
    ```
    This way, if a change is made on the remote, you can sync them via
    ```bash
    oshea collection update  # [ brege-plugins ]
    ```

    **Option C** -- Manual Registration

    You can also register this plugin in a main `oshea` configuration file
    (e.g., your user-level `~/.config/oshea/config.yaml` or a project-specific `config.yaml`).
    ```yaml
    # In your main config.yaml
    plugins:
      # ... other plugins ...
      restaurant-menu: "/full/path/to/your/restaurant-menu/restaurant-menu.config.yaml"
      # Or, if using plugin_directory_aliases:
      # my_plugins_alias: "/full/path/to/your/plugins_base_dir/"
      # restaurant-menu: "my_plugins_alias:restaurant-menu/restaurant-menu.config.yaml"
    ```

4.  **Use Your Plugin Generally**

    Once registered, you can invoke it by name from any directory:
    ```bash
    oshea convert path/to/any_document.md --plugin restaurant-menu
    ```

5.  **Developing a Cloned Version of this Plugin -- Archetyping**

    If you want to create a new, independent plugin based on this `restaurant-menu` plugin (e.g., to make significant changes to `index.js` or `restaurant-menu.css` without altering this original version), you can **archetype** it.

    This command clones the `restaurant-menu` plugin into a new directory (`./my-restaurant-menu` in this example), creating a fresh, independent copy you can freely modify:

    **Option 1** -- If `restaurant-menu` plugin **is registered** already (via Option A, B, or C above)
    ```bash
    oshea plugin create my-restaurant-menu --from restaurant-menu --dir ./my-restaurant-menu
    ```

    **Option 2** -- If `restaurant-menu` **is NOT registered**, but its directory is locally accessible
     (assuming you are in the directory containing this plugin, e.g., 'oshea-plugins')
    ```
    oshea plugin create my-restaurant-menu --from ./restaurant-menu --dir ./my-restaurant-menu
    ```

    After archetyping, remember to register your *new* plugin (`my-restaurant-menu`)
    using
    ```bash
    oshea plugin add ./my-restaurant-menu --name my-restaurant-menu
    ```
    or via manual registration before using it.

