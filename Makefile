pip-upload:
	python setup.py sdist upload

test:
	python -m doctest organ/__init__.py
