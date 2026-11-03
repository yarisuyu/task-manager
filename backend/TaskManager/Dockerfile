# Этап 1: Сборка приложения
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Копируем csproj и восстанавливаем зависимости
COPY ["TaskManager.csproj", "./"]
RUN dotnet restore "TaskManager.csproj"

# Копируем остальные файлы и собираем
COPY . .
RUN dotnet publish "TaskManager.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Этап 2: Запуск приложения
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskManager.dll"]