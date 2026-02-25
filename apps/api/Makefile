.PHONY: dev build test migrate

dev:
	DATABASE_PATH=data/mission.db go run .

build:
	go build -o bin/mission-control-api .

test:
	go test ./...

migrate:
	go run .
