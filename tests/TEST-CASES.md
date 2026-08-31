Dron Mission Control - Intial Test Cases

TC-01 -- Create a user
Given: Valid name, email, password, and role.
When: A new user is created.
Then: The user should be stored in the database with a unique ID.

--------------------------------------------------------

TC-02 -- Create a pilot
Given: An existing user with the pilot role and valid license number.
When: A pilot profile is created.
Then: The pilot should be linked to the user account.

--------------------------------------------------------

TC-03 -- Create a drone
Given: Valid drone name, model, and unique serial number.
When: A drone is created
Then: The drone should be stored with status available.

--------------------------------------------------------

TC-04 -- Create a mission
Given: An existing pilot and available drone
When: A valid mission should be created.
Then: The mission should be created with status planned

--------------------------------------------------------

TC-05 -- Start a mission
Given: A mission with status planned.
When: The mission is started.
Then: Its status should change to in_progress.

--------------------------------------------------------

TC-06 -- Complete a mission
Given: A mission with status in_progress.
When: The mission is completed.
Then: Its status should change to completed and an end time should be recorded.

--------------------------------------------------------

TC-07 -- Cancle a mission
Given: A mission that can be cancelled
When: The mission is cancelled.
Then: Its status should change to cancelled.

--------------------------------------------------------

TC-08 -- Reject invalid pilot
Given: A mission reference a pilot that does not exist.
When: The mission is created.
Then: The request should fail and the mission should not be stored.

--------------------------------------------------------

TC-09 -- Reject unavailable dron
Given: A drone whose status is maintenence or already in use
When: A new mission attempts to use that drone.
Then: The mission should be rejected.

--------------------------------------------------------

TC-10 -- Prevent overlapping missing
Given: A pilot already has a mission schedualed during specific time period.
When: Another mission is created for the same pilot during and overlapping period.
Then: The new mission should be rejected.

--------------------------------------------------------