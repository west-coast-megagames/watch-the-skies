# watch-the-Skies
This is the project file for the Watch the Skies Prototype, made for project nexus.

## File Structure
* reactapp - Front end React Applications
* src - Main source code
    * components - All react components that make up the UI
        * common - Reusable react components
    * pages - All pages within the page routing hiarchy

* server - Node.js Server
    * config - Any keys or configuration files for the server
    * models - All Mongoose document models
        * gov - Models pertaining to the GOVERNANCE sub-game
        * logs - Models pertaining to the in-game logging documents
        * news - Models pertaining to the news agencies
        * ops - Models pertaining to the OPERATIONS sub-game
    * routes - All Express routes
        * api - Currently the main routes folder (Unlear why)
    * util - Application functions
        * init-json - Initial Load data
        * systems - Game systems
            * finance - The financial systems for WTS
            * gameClock - The main gameClock and turn/phase change processing for WTS
            * intercept - The Interception system for WTS

## Scripts
In the server directory, you can run:

#### npm run dev
Runs the react development server and the node server concurrently with nodemon online.

#### $env:DEBUG = "app:*"
Adds Enviornment Variable for DEBUG to run all namespaces

#### $env:DEBUG_COLORS='true'
Adds Enviornment Variable for DEBUG to display each namespace with a seperate color

#### $env:RUN_INIT_REF = 'true'
Enviroment Variable to control running of initRefLoad