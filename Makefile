COMPOSE_FILE=docker-compose.yml

all: up

rebuild: clear up

up:
	@docker-compose -f $(COMPOSE_FILE) up --build
	@echo "Les services sont lancés en arrière-plan."

down:
	@docker-compose -f $(COMPOSE_FILE) down -v
	@echo "Les services ont été arrêtés et les conteneurs supprimés."

ps:
	@docker-compose -f $(COMPOSE_FILE) ps

clean:
	@docker system prune -af
	@echo "Le système a été nettoyé."

clear:
	@docker-compose -f $(COMPOSE_FILE) down -v
	@docker system prune -af
	@echo "Les services ont été arrêtés, les conteneurs supprimés et le système nettoyé."

logs:
	@docker-compose -f $(COMPOSE_FILE) logs -f