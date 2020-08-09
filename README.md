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

#### $env:RUN_INIT_REF='true'
Enviroment Variable to control running of initRefLoad

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
    * models - All Mongoose document models
        * gov - Models pertaining to the GOVERNANCE sub-game
        * logs - Models pertaining to the in-game logging documents
        * news - Models pertaining to the news agencies
        * ops - Models pertaining to the OPERATIONS sub-game
    * routes - All Express routes
        * api - Currently the main routes folder (Unlear why)
    * startup - All functions imported and run at server start
    * test - Jest testing suite for development
        * integration - Home for all integration tests
        * unit - Home for all unit tests
    * util - Application functions
        * dataInit - Initialization server for seeding init data
            * config - Enviornment variable for init server
            * init-json - Initial Load data
        * systems - Server level game functions
        * wts - Watch the Skies game functions
            * banking - The financial systems for WTS
            * gameClock - The main gameClock and turn/phase change processing for WTS
            * intercept - The Interception system for WTS
            * notifications - Temp notifications system for WTS
            * pr - The PR system for WTS