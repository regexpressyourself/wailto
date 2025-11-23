PROJECT_NAME := $(notdir $(CURDIR))

up:
	docker compose -p $(PROJECT_NAME) up -d

down:
	docker compose -p $(PROJECT_NAME) down

pull:
	docker compose -p $(PROJECT_NAME) pull

restart: pull
	docker compose -p $(PROJECT_NAME) up -d

logs:
	docker compose -p $(PROJECT_NAME) logs -f

ps:
	docker compose -p $(PROJECT_NAME) ps

rebuild:
	docker compose -p $(PROJECT_NAME) up -d --build

prune:
	docker system prune -f
