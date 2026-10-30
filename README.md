Part 3:
None of the 3 updates succeeded. Uther Lightbringer's change says the name must be alphanumeric, shadowhear's says its in invalid class, and Geralt of Riva's also says the name must be alpha numeric.
As far as I saw in the terminal, the backend didn't specifically say any errors. it was filled with select statements.
A character can be rejected when being updated because that is where we have checks on our inputs, not from when we retrieve it. If the data in our db is giving us unexpected results, then that means there is either somewhere else where we aren't checking inputs or we just don't understand our db well enough.
Since we have everything in a form, we just forward the error onto the page itself. No need to add anything else. 