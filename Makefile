COMPOSE_FILE=docker-compose.yml
COMPOSE_FILE_DEV=docker-compose.dev.yml

all: up

prod: clear up

dev: clear dev-up

dev-up:
	@docker-compose -f $(COMPOSE_FILE_DEV) up --build
	@echo "Les services de développement sont lancés en arrière-plan."

dev-down:
	@docker-compose -f $(COMPOSE_FILE_DEV) down -v
	@echo "Les services de développement ont été arrêtés et les conteneurs supprimés."

dev-ps:
	@docker-compose -f $(COMPOSE_FILE_DEV) ps

dev-clear:
	@docker-compose -f $(COMPOSE_FILE_DEV) down -v
	@docker system prune -af
	@echo "Les services de développement ont été arrêtés, les conteneurs supprimés et le système nettoyé."

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