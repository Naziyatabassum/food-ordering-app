FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/food-ordering-backend-1.0.0.jar ./app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
