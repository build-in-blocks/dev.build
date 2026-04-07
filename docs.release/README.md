
# Release guide: For maintainers incharge of publishing the package

> [!NOTE]  
> Before releasing/publishing a newer version of this package, do the following so that users and contributors are not affected negatively. Once the requirements below are satisfied, you can publish to the npm registry 🎉

#

> [!NOTE]  
> Some or all of the processes below will be automated later. For now, ensure to "triple check" these before release.

#

#### This library

- In the **root README**, always remember to change `@build-in-blocks/dev.build@[VERSION_NUMBER]` for the npm scripts part of the docs too, as you bump up the `package.json` version.

#

#### Connected user apps

- The "user app" built with this library requires you to build/generate a new bundle for consumption - Don't forget to run the `build` script command before publishing.

- Before release (of your "user app" - e.g. dom.autoquery in this case), you always have to check that npx is referencing the correct/updated version in the scripts section of the package.json e.g. @1.0.0 in this case.

    ````
    "scripts": {
        "dev": "npx @build-in-blocks/dev.build@1.0.0 dev:build",
        "build": "npx @build-in-blocks/dev.build@1.0.0 prod:build"
        // your other npm scripts in your project goes here as usual
    },
    ````

#

#### Build in blocks libraries in general

- **Update contributors list:** Check to see that all contributors who contributed to the success of the new release have been added to the **contributors list** on the **root README**.

- **Ensure related-code works:** Check that all features to be released in the new version are working as expected, and are complete as shown on our project board.

- **General user guide updates:** Check that the wiki for the general user guide is updated when e.g. typescript version and compatibility has changed in the library's code.

- **Confirm package.json & docs content:** Always confirm that the content of the `package.json` (`scripts`, the `keywords` array etc.), as well as the **root README**, **user docs**, **contributor docs** and **release docs** content are in good/acceptable shape for the release.

- **Version bumping:** Pending the time when we will automate the version bumping process, always remember to update the version number to a new one in the `package.json` file.

- **Regenerate lock file:** Changes made to the `package.json` should be made to reflect in the lock file. Delete the `package-lock.json` file and the `node_modules` folder, then run `npm i` to generate a new `package-lock.json` file.

- **Pull updated develop branch & create tag:** Double check that you have pulled all the latest changes to your **local** `develop` branch. Create a new tag for the release, via the release page: https://github.com/build-in-blocks/dev.setup/releases.
