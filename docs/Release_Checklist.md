# Release Checklist
This document shows the steps to follow when releasing a new version of Open Scouting

1. Update the [Roadmap](./ROADMAP.md) to ensure all completed tasks have been checked off, then move the version that is being released to the "Completed" section
2. Update the `CLIENT_VERSION` string in [`version.js`](/scouting/static/main/scripts/version.js) to what the new version will be
3. Update the `SERVER_VERSION` string in [`settings.py`](/scouting/scouting/settings.py) to what the new version will be
4. Ensure all pull requests for this version have been merged into `development`
5. Type out the release notes on the GitHub for creating new releases
    - Be sure to follow the format from previous releases, and include a summary, screenshot, full list of changes, what issues were closed, and who contributed to this release
    - Make sure to set the tag correctly, and mark as a pre release version if the version is `alpha`, `beta` or `rc`
    - Don't submit this release yet, wait until the pull request for that version is merged
    - Use the "Save as Draft" button as needed, if the PR isn't ready to be merged yet
6. Create a pull request into `main` from `development` for this new version, and paste the release notes as the description (or make a new comment if the PR already exists)
7. Merge the version's PR into `main`
8. Publish the release

Open Scouting has now been updated to a new version!

Ensure any production servers are also updated with this change