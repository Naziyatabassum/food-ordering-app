@REM Maven Wrapper startup batch script
@REM --------------------------------------------------------------------------
@setlocal
@set WRAPPER_JAR="%~dp0\.mvn\wrapper\maven-wrapper.jar"
@set WRAPPER_URL="https://repo1.maven.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

@if exist %WRAPPER_JAR% (
    java -jar %WRAPPER_JAR% %*
) else (
    echo Downloading Maven Wrapper...
    powershell -Command "Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR%"
    java -jar %WRAPPER_JAR% %*
)
