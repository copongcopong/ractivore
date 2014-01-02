RACTIVORE
==========


Info
-----
* RactiveJS on the server-side
* Server-side RactiveJS data, templates, options, logic, etc consumable on the client-side (via Mustache-helpers)  
* Based/uses on [RactiveJS](https://github.com/RactiveJS/Ractive) extensively.
* Uses Promises (by [kew](https://github.com/Obvious/kew))
* Creates view based on RactiveJS' templating logic (mustache-like)
* Sub views, templates, and data are rendered/loaded asyncronously ([kew](https://github.com/Obvious/kew).all)
* beforeCreate and afterCreate callbacks (Promise.defer.resolve)
* Loads view/subviews from folder/directory

  > dir/template.html, dir/data.json, dir/partial.part.html (partials), dir/events.js (for client-side-parsing)

* Data is overloaded with Mustache-helpers ([Expression](http://learn.ractivejs.org/expressions/1/)) to help/bridge Server-side-ractive to Client-side-ractive.

TODO
----

* Publish to NPM
* add tests
* add more example


Sample Usage
-------------

Run:

`node simple/server.js`

See:

> example/simple/*.js

> example/views

Docs
-----

