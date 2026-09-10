@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@if "%DEBUG%" == "" @echo off
@classlocation "%~dp0"

setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set MAVEN_PROJECT_BASEDIR=%DIRNAME%

@REM Find JAVA_HOME or javac
if defined JAVA_HOME goto findMaven
set JAVA_HOME=C:\Users\Ninja\.jdks\jdk-21.0.6+7
if exist "%JAVA_HOME%\bin\java.exe" goto findMaven

:findMaven
set MAVEN_HOME=%DIRNAME%\.mvn\wrapper
set MAVEN_JAR=%MAVEN_HOME%\maven-wrapper.jar

if exist "%JAVA_HOME%\bin\java.exe" (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
    set "JAVA_EXE=java"
)

"%JAVA_EXE%" -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: JAVA_HOME is not set and no suitable java command was found in PATH.
    exit /b 1
)

@REM Execute Maven
"%JAVA_EXE%" -jar "%MAVEN_JAR%" %*
