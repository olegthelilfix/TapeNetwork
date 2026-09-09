// Applies the SonarQube Gradle plugin at analysis time ONLY, so the tracked
// backend/build.gradle.kts stays clean and normal builds don't pull sonar.
// Used by the TeamCity "Sonar analysis" config:
//   ./gradlew --init-script ../teamcity/sonar/sonar-init.gradle.kts sonar
//
// Reads connection details from env vars set by the build step:
//   SONAR_HOST_URL, SONAR_TOKEN  (the sonar plugin picks these up itself).
initscript {
    repositories { gradlePluginPortal() }
    dependencies { classpath("org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:5.1.0.4882") }
}

rootProject {
    apply<org.sonarqube.gradle.SonarQubePlugin>()
    extensions.configure<org.sonarqube.gradle.SonarExtension>("sonar") {
        properties {
            property("sonar.projectKey", "tape-backend")
            property("sonar.projectName", "tape-backend")
        }
    }
}
