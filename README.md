# watch-the-Skies
This is the project file for the Watch the Skies Prototype, made for project nexus. Current Build: v0.1.3 - Basic Game-Loop Build.

## Scripts
In the server directory, you can run:

#### npm run dev
Runs the react development server and the node server concurrently with nodemon online.

#### $env:DEBUG = "app:*"
Adds Enviornment Variable for DEBUG to run all namespaces

#### $env:DEBUG_COLORS='true'
Adds Enviornment Variable for DEBUG to display each namespace with a seperate color

## File Structure
* reactapp - Front end React Applications
    * src - Main source code
        * components - All react components that make up the UI
            * common - Reusable react components
        * pages - All pages within the page routing hiarchy
            * tabs - The tabs with components for each tab in the modules
                * gov - The tabs relating to the governance module
                * news - The tabs relating to the news module

* server - Node.js Server
    * config - Any keys or configuration files for the server
		* middleware
    * models - All Mongoose document models
        * gov - Models pertaining to the GOVERNANCE sub-game
        * logs - Models pertaining to the in-game logging documents
        * news - Models pertaining to the news agencies
        * ops - Models pertaining to the OPERATIONS sub-game
    * routes - All Express routes
        * api - Currently the main routes folder (Unlear why)
				* game - Depreciated folder of game logic routes
				* init - Routes for init of DB
				* log - Routes for error logging
				* public - Routes for HTML pages
				* socket - Socket.io routes
    * tests - Jest testing suite for development
        * integration - Home for all integration tests
        * unit - Home for all unit tests
    * util - Application functions
        * systems - Server level game functions
        * wts - Watch the Skies game functions
					* construction
          * gameClock - The main gameClock and turn/phase change processing for WTS
          * governance
					* intercept - The Interception system for WTS
          * json
					* military
					* notifications - Temp notifications system for WTS
          * research
					* pr - The PR system for WTS
					* sites
					* terror
					* trades
					* upgrades
					* util