FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/location-service-1.0.0.jar app.jar

EXPOSE 8091

ENTRYPOINT ["java", "-jar", "app.jar"]