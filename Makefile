build:
	docker build -t orbitdns .

daemon:
	docker run \
		-v `pwd`/.orbitdns:/root/.orbitdns \
		--name=orbitdns \
		orbitdns daemon


clean:
	docker rm -f orbitdns || true
	docker rmi -f orbitdns:latest || true


rebuild: clean build
