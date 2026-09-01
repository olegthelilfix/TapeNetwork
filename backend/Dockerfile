# ---- build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle ./gradle
COPY settings.gradle.kts build.gradle.kts ./
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# ---- run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN mkdir -p /var/lib/tape/search
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
