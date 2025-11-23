all:
	tsc
	@echo ""
	@echo ""
	@echo ""
	@echo "Run localhost:8080 on a browser"
	@echo ""
	@echo ""
	@echo ""
	cd srcs/frontend && python3 -m http.server 8080

.PHONY: all