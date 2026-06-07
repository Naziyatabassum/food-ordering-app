# Root Dockerfile builds frontend and backend together for a single Docker deployment.
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build -- --outputPath=dist/frontend --configuration production

FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/src ./src
COPY --from=frontend-build /frontend/dist/frontend ./src/main/resources/static
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/target/food-ordering-backend-1.0.0.jar ./app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
