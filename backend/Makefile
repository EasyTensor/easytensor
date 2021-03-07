
unittest:
	BACKEND_APP_PATH=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST)))) \
	PYTHONPATH=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST)))) \
	python3 -m unittest discover tests --pattern "*_test.py"
