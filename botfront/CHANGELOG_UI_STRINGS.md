# Files with changes in the Botfront UI
All files that have been changed, have been tagged with the `// CHANGED: [LINE NO]` 
comment in them. Just search for the `CHANGED` commment within the code, to see 
the changes made and the line affected. For inline comments, the `LINE NO` is 
optional. But, for multiline changes, the `LINE NO` tag is an absolute neccessity.

A tagging system such as this is important in tracking which areas of the code have 
been affected, and allow for any flexibility for a new direction of the project.

**NOTE:** The `public` folder with icons has been changed to match the company 
logos and favicon(s). The changes have not been well documented. Any attempt to 
reverse the effects, should be matched with the original Botfront repository icons.

## Files with String changes in `botfront/imports/ui/components`
```
* admin/
..* setup.import.less
..* settings/Settings.jsx
..* settings/MigrationControl.jsx
..* 

* coversations/
..* utils.test.js
..* utils.test.data.json: [104] botfront.io/image.png -> https://belltro.com/images/icons/Chatbots.svg

* project/ProjectSidebar.jsx

* setup/Welcome.jsx

* templates-list/TemplatesTable.jsx
* stories/
..* StoryErrorBoundary.jsx
..* common/
..* ..* StoryVisualEditor.jsx
..* ..* AddStoryLine.jsx

* ErrorCatcher.jsx

```

## Files with String changes in `botfront/imports/ui/layouts`
```
* chat.demo.jsx
* project.jsx
* account.jsx
* setup.import.less
* setup.jsx
```

## File changes in non UI Strings
* botfront/imports/startup/client/routes.jsx
* botfront/client/variables.import.less