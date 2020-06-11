@ECHO OFF 
echo Setting Dev Environment
set NODE_ENV=development
set DEBUG="app:*"
set DEBUG_COLORS="true"
set RUN_INIT_REF="false"
echo NODE_ENV: %NODE_ENV%
echo DEBUG: %DEBUG%
echo DEBUG_COLORS: %DEBUG_COLORS%
echo RUN_INIT_REF: %RUN_INIT_REF%
pause

